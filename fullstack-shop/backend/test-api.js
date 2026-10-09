const assert = require('assert');
const path = require('path');
const fs = require('fs').promises;

const DATA_FILE = path.join(__dirname, 'data.json');
const BACKUP_FILE = path.join(__dirname, '.data.test-backup.json');

async function runTests() {
  const originalData = await fs.readFile(DATA_FILE, 'utf8').catch(() => null);
  if (originalData) await fs.writeFile(BACKUP_FILE, originalData);

  // Reset test data
  const testData = {
    products: [
      { id: 101, name: 'Sản phẩm test', price: 100000 }
    ],
    cart: []
  };
  await fs.writeFile(DATA_FILE, JSON.stringify(testData, null, 2));

  // Require server
  const express = require('express');
  const cors = require('cors');

  // We can test server endpoints by running an instance
  // or spawning server.js
  const { spawn } = require('child_process');
  const child = spawn(process.execPath, ['server.js'], { cwd: __dirname });

  // Wait for server to spin up
  await new Promise(r => setTimeout(r, 1200));

  try {
    // 1. GET products
    const resProducts = await fetch('http://localhost:5000/api/products');
    const products = await resProducts.json();
    assert.strictEqual(resProducts.status, 200);
    assert.strictEqual(products.length, 1);

    // 2. POST product
    const resPost = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Sản phẩm mới', price: 200000 })
    });
    const newProd = await resPost.json();
    assert.strictEqual(resPost.status, 201);
    assert.strictEqual(newProd.name, 'Sản phẩm mới');

    // 3. PUT product
    const resPut = await fetch(`http://localhost:5000/api/products/${newProd.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Sản phẩm đã sửa', price: 250000 })
    });
    const updatedProd = await resPut.json();
    assert.strictEqual(resPut.status, 200);
    assert.strictEqual(updatedProd.name, 'Sản phẩm đã sửa');
    assert.strictEqual(updatedProd.price, 250000);

    // 4. POST cart
    const resCartAdd = await fetch('http://localhost:5000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: updatedProd.id, quantity: 2 })
    });
    assert.strictEqual(resCartAdd.status, 200);

    // 5. GET cart
    const resCart = await fetch('http://localhost:5000/api/cart');
    const cart = await resCart.json();
    assert.strictEqual(resCart.status, 200);
    assert.strictEqual(cart.totalCount, 2);
    assert.strictEqual(cart.totalAmount, 500000);

    // 6. DELETE cart item
    const resCartDel = await fetch(`http://localhost:5000/api/cart/${updatedProd.id}`, {
      method: 'DELETE'
    });
    assert.strictEqual(resCartDel.status, 200);

    // 7. DELETE product
    const resDel = await fetch(`http://localhost:5000/api/products/${newProd.id}`, {
      method: 'DELETE'
    });
    assert.strictEqual(resDel.status, 200);

    console.log('ALL ADVANCED BACKEND TESTS PASSED!');
  } finally {
    child.kill('SIGKILL');
    if (originalData) {
      await fs.writeFile(DATA_FILE, originalData);
      await fs.rm(BACKUP_FILE, { force: true });
    }
  }
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
