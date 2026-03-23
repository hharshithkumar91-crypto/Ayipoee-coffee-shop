const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5001/api'
  : 'https://ayipoee-coffee-shop-backend.vercel.app/api'; // replace with your deployed backend URL
let products = [];

async function loadProducts () {
  try {
    const res = await fetch(`${API}/products`);
    const data = await res.json();
    products = data;
    const productsDiv = document.getElementById('products');
    productsDiv.innerHTML = data.length
      ? data.map(p => `<div><strong>${p.name}</strong>: ${p.description || ''} - ₹${p.price.toFixed(2)}</div>`).join('')
      : '<p>No products available yet.</p>';
  } catch (err) {
    document.getElementById('products').textContent = 'Unable to load menu. Start backend first.';
  }
}

document.getElementById('refreshProducts').addEventListener('click', e => { e.preventDefault(); loadProducts(); });

function addItemSelect() {
  const container = document.getElementById('productSelects');
  const div = document.createElement('div');
  div.innerHTML = `
    <select class="productSelect" required>
      <option value="">Select product</option>
      ${products.map(p => `<option value="${p._id}" data-price="${p.price}">${p.name} - ₹${p.price}</option>`).join('')}
    </select>
    <input type="number" class="quantity" min="1" value="1" required />
    <button type="button" class="removeItem">Remove</button>
  `;
  container.appendChild(div);
  div.querySelector('.removeItem').addEventListener('click', () => div.remove());
}

document.getElementById('addItem').addEventListener('click', addItemSelect);

document.getElementById('orderForm').addEventListener('submit', async e => {
  e.preventDefault();
  const customerName = document.getElementById('customerName').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const itemDivs = document.querySelectorAll('#productSelects > div');

  if (!customerName || itemDivs.length === 0) {
    document.getElementById('orderFeedback').textContent = 'Please fill required fields and add items.';
    return;
  }

  const items = Array.from(itemDivs).map(div => {
    const select = div.querySelector('.productSelect');
    const quantity = parseInt(div.querySelector('.quantity').value, 10);
    const option = select.options[select.selectedIndex];
    const productId = option.value;
    const name = option.text.split(' - ')[0];
    const price = parseFloat(option.getAttribute('data-price'));
    return { productId, name, quantity, price };
  });

  try {
    const resp = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, email, phone, items }),
    });

    const result = await resp.json();
    document.getElementById('orderFeedback').textContent = resp.ok
      ? 'Order created successfully!'
      : `Error: ${result.error || 'Unable to place order'}`;
    if (resp.ok) {
      document.getElementById('orderForm').reset();
      document.getElementById('productSelects').innerHTML = '';
    }
  } catch (err) {
    document.getElementById('orderFeedback').textContent = 'Network error. Backend may be down.';
  }
});

loadProducts();
