const { createClient } = require('@supabase/supabase-js');

// Supabase����
const SUPABASE_URL = 'https://bndruoeqxhydszlirmoe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZHJ1b2VxeGh5ZHN6bGlybW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjc2MjIsImV4cCI6MjA2Mjg0MzYyMn0.XQXj22enD7xA9ffiiLGQ-_AdUlwgngHbYagX8kgBO8g';

// ����Supabase�ͻ���
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ����ǰ��API URL��ʽ����
async function testApiUrlFormat() {
  console.log('����API URL��ʽ����...');
  
  // �����ַ���ID��UUID�ļ�����
  const testIds = [
    'demo-project-1',  // �ַ���ID
    '21152cfd-591f-4b55-bc88-90be716dcc75'  // UUID��ʽ
  ];
  
  for (const id of testIds) {
    console.log(\n����ID: );
    
    try {
      // ����projects API
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (projectError) {
        console.error( ʹ��ID  ��ѯ��Ŀʧ��: );
      } else if (project) {
        console.log( ʹ��ID  ��ѯ��Ŀ�ɹ�: );
      } else {
        console.log(! ʹ��ID  δ�ҵ���Ŀ);
      }
      
      // ����twitter_posts API
      const { data: tweets, error: tweetsError } = await supabase
        .from('twitter_posts')
        .select('*')
        .eq('project_id', id)
        .limit(1);
      
      if (tweetsError) {
        console.error( ʹ��project_id  ��ѯTwitter����ʧ��: );
      } else {
        console.log( ʹ��project_id  ��ѯTwitter���ӳɹ�: �ҵ�  ��);
      }
      
      // ����telegram_posts API
      const { data: telegrams, error: telegramsError } = await supabase
        .from('telegram_posts')
        .select('*')
        .eq('project_id', id)
        .limit(1);
      
      if (telegramsError) {
        console.error( ʹ��project_id  ��ѯTelegram����ʧ��: );
      } else {
        console.log( ʹ��project_id  ��ѯTelegram���ӳɹ�: �ҵ�  ��);
      }
      
    } catch (error) {
      console.error( ����ID  ʱ����: );
    }
  }
}

// ִ�в���
testApiUrlFormat().catch(console.error);
