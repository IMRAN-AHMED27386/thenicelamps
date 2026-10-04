const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "aidavibes-store",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const snap = await getDocs(collection(db, 'admins'));
    snap.docs.forEach(d => console.log(d.id));
  } catch (e) {
    console.error(e);
  }
}
run();
