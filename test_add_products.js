const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDocs, collection } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "thenicelamps-store",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  await setDoc(doc(db, "products", "test-product-3"), { name: "Test Product 3", price: 300, sortOrder: 3, category: "table-lamp" });
  const snap = await getDocs(collection(db, "products"));
  console.log(snap.docs.map(d => d.id));
}
run().catch(console.error);
