// Placeholder for main JS logic
console.log('Travel Car & Hotel Reservation App loaded!');

// Example: Fetch bookings and display
fetch('/api/bookings')
  .then(res => res.json())
  .then(bookings => {
    const appDiv = document.getElementById('app');
    const bookingsList = document.createElement('ul');
    bookings.forEach(b => {
      const li = document.createElement('li');
      li.textContent = `Booking for ${b.user || 'Unknown'}: ${b.status || 'N/A'}`;
      bookingsList.appendChild(li);
    });
    appDiv.appendChild(bookingsList);
  });

// Add review form and display reviews
function renderReviewForm() {
  const appDiv = document.getElementById('app');
  const form = document.createElement('form');
  form.innerHTML = `
    <h2>Leave a Review</h2>
    <input type="text" name="user" placeholder="User ID" required />
    <input type="text" name="hotel" placeholder="Hotel ID (optional)" />
    <input type="text" name="car" placeholder="Car ID (optional)" />
    <input type="number" name="rating" min="1" max="5" placeholder="Rating" required />
    <textarea name="comment" placeholder="Comment"></textarea>
    <button type="submit">Submit Review</button>
  `;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    alert('Review submitted!');
    loadReviews();
  };
  appDiv.appendChild(form);
}

function loadReviews() {
  fetch('/api/reviews')
    .then(res => res.json())
    .then(reviews => {
      const appDiv = document.getElementById('app');
      const reviewsList = document.createElement('ul');
      reviews.forEach(r => {
        const li = document.createElement('li');
        li.textContent = `User: ${r.user}, Rating: ${r.rating}, Comment: ${r.comment}`;
        reviewsList.appendChild(li);
      });
      appDiv.appendChild(reviewsList);
    });
}

renderReviewForm();
loadReviews();

// TODO: Add UI for search, payment, reviews, notifications, admin
// Notification UI
function renderNotificationForm() {
  const appDiv = document.getElementById('app');
  const form = document.createElement('form');
  form.innerHTML = `
    <h2>Send Notification</h2>
    <input type="email" name="to" placeholder="Recipient Email" required />
    <input type="text" name="subject" placeholder="Subject" required />
    <textarea name="text" placeholder="Message" required></textarea>
    <button type="submit">Send Notification</button>
  `;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      alert('Notification sent!');
    } else {
      alert('Failed to send notification.');
    }
  };
  appDiv.appendChild(form);
}

renderNotificationForm();
