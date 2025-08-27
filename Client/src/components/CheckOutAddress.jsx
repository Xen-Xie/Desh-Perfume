import React from 'react'

function CheckOutAddress() {
  return (
    <>
      {/* STATIC ADDRESS CARD */}
      <div className="w-full md:w-1/3 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-3">Delivery Address</h2>
        <p className="text-gray-700">Rakibul Hasan</p>
        <p className="text-gray-600">Dhaka, Bangladesh</p>
        <p className="text-gray-600">Phone: +880123456789</p>
      </div>
    </>
  )
}

export default CheckOutAddress