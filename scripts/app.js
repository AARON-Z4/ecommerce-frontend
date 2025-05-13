console.log("E-Commerce Website Loaded");

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let allProducts = [];

const productGrid = document.getElementById('productGrid');
const cartBadge = document.querySelector('.cart-badge');
const cartModal = document.getElementById('cart-modal');
const closeModalBtn = document.querySelector('.close');
const cartItemsContainer = document.getElementById('cart-items');
const checkoutBtn = document.querySelector('.checkout-btn');

// Show loader
productGrid.innerHTML = `<p>Loading products...</p>`;

fetch('https://fakestoreapi.com/products')
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    populateCategoryFilter(data);
    displayProducts(data);
  })
  .catch(error => {
    productGrid.innerHTML = `<p>Failed to load products. Please try again later.</p>`;
    console.error("API error:", error);
  });

function displayProducts(products) {
  productGrid.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}" loading="lazy" />
      <h3>${product.title}</h3>
      <p>$${product.price}</p>
      <button class="add-to-cart">Add to Cart</button>
    `;
    productGrid.appendChild(card);
  });

  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const productCard = e.target.closest('.product-card');
      const title = productCard.querySelector('h3').innerText;
      const price = productCard.querySelector('p').innerText;
      const image = productCard.querySelector('img').src;
      cart.push({ title, price, image });
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartBadge();
    });
  });
}

function updateCartBadge() {
  cartBadge.innerText = cart.length;
}

function populateCategoryFilter(products) {
  const categories = [...new Set(products.map(p => p.category))];
  const categoryFilter = document.getElementById('categoryFilter');
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });
}

// Filter & Sort Logic
document.getElementById('categoryFilter').addEventListener('change', applyFilters);
document.getElementById('sortOption').addEventListener('change', applyFilters);
document.getElementById('searchInput').addEventListener('input', applyFilters);

function applyFilters() {
  let filtered = [...allProducts];

  const selectedCategory = document.getElementById('categoryFilter').value;
  if (selectedCategory !== 'all') {
    filtered = filtered.filter(p => p.category === selectedCategory);
  }

  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  if (searchQuery) {
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery)
    );
  }

  const sortOption = document.getElementById('sortOption').value;
  if (sortOption === 'priceAsc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'priceDesc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'titleAsc') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === 'titleDesc') {
    filtered.sort((a, b) => b.title.localeCompare(a.title));
  }

  displayProducts(filtered);
}

// Cart Modal Logic
document.querySelector('.cart').addEventListener('click', () => {
  cartModal.style.display = 'block';
  showCartItems();
});

closeModalBtn.addEventListener('click', () => {
  cartModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === cartModal) {
    cartModal.style.display = 'none';
  }
});

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const totalAmount = cart.reduce((sum, item) => sum + parseFloat(item.price.replace('$', '')), 0).toFixed(2);
  const confirmCheckout = confirm(`Your total is $${totalAmount}. Proceed to checkout?`);
  if (confirmCheckout) {
    alert("Thank you for your purchase!");
    cart = [];
    localStorage.removeItem('cart');
    updateCartBadge();
    showCartItems();
    cartModal.style.display = 'none';
  }
});

function showCartItems() {
  cartItemsContainer.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('cart-item');
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.title}" width="50" />
      <div class="cart-item-details">
        <p>${item.title}</p>
        <p>${item.price}</p>
      </div>
    `;
    cartItemsContainer.appendChild(itemDiv);
    total += parseFloat(item.price.replace('$', ''));
  });

  document.getElementById('total-price').innerText = total.toFixed(2);
}

updateCartBadge();
