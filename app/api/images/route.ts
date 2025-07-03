import { NextResponse } from "next/server"
import { saveImageToDatabase, getImages } from "@/lib/database"
import { v2 as cloudinary } from 'cloudinary'

// Cloudinary配置 - 硬编码API密钥
const cloudName = 'druoxjenv' // 你的Cloudinary云名称
const apiKey = '597294163335814' // 你的API密钥
const apiSecret = 'aImqDgYU0bbb2_CyzkZ6_mZ5L4U' // 你的API密钥

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

/** GET /api/images?projectId=xxx */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get("projectId")
  const category = searchParams.get("category")

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 })
  }

  try {
    const images = await getImages(projectId, category || undefined)
    return NextResponse.json({ images })
  } catch (err) {
    console.error("GET /api/images error:", err)
    return NextResponse.json(
      { error: "无法加载图片", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}

/** POST /api/images - 支持FormData文件上传 */
export async function POST(req: Request) {
  try {
    // 检查是否是FormData请求
    const contentType = req.headers.get('content-type') || '';
    
    // 处理FormData文件上传
    if (contentType.includes('multipart/form-data')) {
      let formData;
      try {
        formData = await req.formData();
      } catch (error) {
        console.error('FormData解析错误:', error);
        return NextResponse.json({ error: "无法解析FormData" }, { status: 400 });
      }
      
      const file = formData.get('file') as File;
      const projectId = formData.get('projectId') as string;
      const category = formData.get('category') as string;
      const tags = formData.get('tags') as string;
      
      console.log('接收到的数据:', {
        hasFile: !!file,
        fileName: file?.name,
        projectId,
        category,
        tags
      });
      
      if (!file || !projectId) {
        return NextResponse.json({ error: "file and projectId are required" }, { status: 400 })
      }
      
      // 读取文件内容为Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // 生成base64编码的文件内容
      const base64File = buffer.toString('base64');
      const base64FileWithPrefix = `data:${file.type};base64,${base64File}`;
      
      // 上传到Cloudinary
      const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        cloudinary.uploader.upload(
          base64FileWithPrefix, 
          {
            folder: 'yunying',
            resource_type: 'auto',
          }, 
          (error: Error | undefined, result: CloudinaryUploadResult | undefined) => {
            if (error || !result) reject(error || new Error('Upload failed'));
            else resolve(result);
          }
        );
      });
      
      // 保存图片元数据到数据库
      let parsedTags: string[] | undefined = undefined;
      if (tags) {
        try {
          if (Array.isArray(tags)) {
            parsedTags = tags;
          } else if (typeof tags === 'string') {
            // 尝试解析为JSON数组
            if (tags.trim().startsWith('[')) {
              parsedTags = JSON.parse(tags);
            } else {
              // 普通逗号分隔字符串
              parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
            }
          }
        } catch {
          parsedTags = undefined;
        }
      }
      const imageData = {
        filename: uploadResult.public_id,
        original_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        blob_url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        project_id: projectId,
        category: category || undefined,
        tags: parsedTags
      };
      
      const image = await saveImageToDatabase(imageData);
      return NextResponse.json({ image }, { status: 201 });
    } 
    // 处理JSON请求（保持向后兼容）
    else {
      const data = await req.json();
      // tags兼容处理
      let parsedTags: string[] | undefined = undefined;
      if (data.tags) {
        try {
          if (Array.isArray(data.tags)) {
            parsedTags = data.tags;
          } else if (typeof data.tags === 'string') {
            if (data.tags.trim().startsWith('[')) {
              parsedTags = JSON.parse(data.tags);
            } else {
              parsedTags = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
            }
          }
        } catch {
          parsedTags = undefined;
        }
      }
      data.tags = parsedTags;
      const image = await saveImageToDatabase(data);
      return NextResponse.json({ image }, { status: 201 });
    }
  } catch (err) {
    console.error("POST /api/images error:", err)
    return NextResponse.json(
      { error: "图片保存失败", details: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
