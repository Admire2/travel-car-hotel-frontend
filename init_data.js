db.users.insertOne({
  username: "demo_user",
  email: "demo_user@example.com",
  password: "demo_password",
  createdAt: new Date()
})

db.transactions.insertOne({
  user: "demo_user",
  amount: 100,
  currency: "USD",
  type: "booking",
  status: "completed",
  createdAt: new Date()
})
