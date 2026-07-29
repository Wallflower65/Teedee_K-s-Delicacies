export function calculateTotals(cartItems, deliveryFee) {
  let subtotal = 0;
  let discount = 0;
  let cakeStack = [];

  cartItems.forEach(item => {
    const itemPrice = Number(item.price);
    subtotal += itemPrice * item.quantity;
    
    if (item.is_cake) {
      for (let i = 0; i < item.quantity; i++) {
        cakeStack.push(itemPrice);
      }
    }
  });

  cakeStack.sort((a, b) => b - a);

  // Buy 4 Get 1 Free
  while (cakeStack.length >= 5) {
    const groupOfFive = cakeStack.splice(0, 5);
    discount += groupOfFive[4];
  }

  // 3 for R180 combo
  while (cakeStack.length >= 3) {
    const groupOfThree = cakeStack.splice(0, 3);
    const standardPrice = groupOfThree.reduce((sum, p) => sum + p, 0);
    if (standardPrice > 180) {
      discount += (standardPrice - 180);
    }
  }

  const total = subtotal - discount + Number(deliveryFee);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    deliveryFee: Number(deliveryFee.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}