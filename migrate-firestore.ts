import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection } from 'firebase/firestore';
import fs from 'fs';

const targetConfig = {
  apiKey: "AIzaSyDFCQpU5HXpsbs4ZAe3wFyePfhndj2myas",
  authDomain: "bettercraftsite-ed341.firebaseapp.com",
  projectId: "bettercraftsite-ed341",
  storageBucket: "bettercraftsite-ed341.firebasestorage.app",
  messagingSenderId: "363216850132",
  appId: "1:363216850132:web:01645e6ccaa73c300cbf41",
};

async function restore() {
  console.log('🚀 Conectando ao Firestore: bettercraftsite-ed341...');

  if (!fs.existsSync('firestore-backup.json')) {
    console.error('Arquivo firestore-backup.json não encontrado!');
    process.exit(1);
  }

  const backupData = JSON.parse(fs.readFileSync('firestore-backup.json', 'utf-8'));
  const targetApp = initializeApp(targetConfig);
  const targetDb = getFirestore(targetApp);

  let totalMigrated = 0;

  for (const [colName, docs] of Object.entries<any[]>(backupData)) {
    console.log(`\n📦 Migrando coleção: "${colName}" (${docs.length} itens)...`);
    let count = 0;
    for (const item of docs) {
      const { id, ...data } = item;
      const targetDocRef = doc(targetDb, colName, id);
      await setDoc(targetDocRef, data);
      count++;
      totalMigrated++;
      console.log(`  [OK] ${colName}/${id}`);
    }
    console.log(`✅ Coleção "${colName}" finalizada: ${count} documentos importados.`);
  }

  console.log(`\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO! Total de ${totalMigrated} documentos importados.`);
  process.exit(0);
}

restore().catch((err) => {
  console.error('\n❌ Erro durante a migração:', err.message || err);
  if (err.message && err.message.includes('NOT_FOUND')) {
    console.log('\n💡 DICA: O Firestore ainda não foi ativado no console.');
    console.log('Acesse https://console.firebase.google.com/project/bettercraftsite-ed341/firestore e clique em "Criar banco de dados".');
  }
  process.exit(1);
});
