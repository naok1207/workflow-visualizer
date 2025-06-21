import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { initDatabase } from '../src/database/init.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('🚀 データベース初期化を開始します...');

  try {
    // データディレクトリの作成
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('✅ データディレクトリを作成しました:', dataDir);
    }

    // データベースの初期化
    const db = await initDatabase();
    console.log('✅ データベースを初期化しました');

    // テーブルの確認
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `).all() as { name: string }[];

    console.log('\n📊 作成されたテーブル:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });

    // タスクタイプの確認
    const taskTypes = db.prepare(`
      SELECT * FROM task_types
    `).all();

    console.log('\n📋 登録されたタスクタイプ:');
    taskTypes.forEach((type: any) => {
      console.log(`  - ${type.type_id}: ${type.name}`);
    });

    db.close();
    console.log('\n✨ データベースの初期化が完了しました！');
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();