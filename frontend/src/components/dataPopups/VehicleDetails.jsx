import React from "react";

const VehicleDetails = ({ vehicle }) => {
  const {
    numberPlate,
    vehicleType,
    vehicleCapacity,
    fuelType,
    mileage,
    insuranceExpiryDate,
    LicenedDate,
    lastServiceDate,
    nextServiceDue,
    vehicleImgUrl,
    status,
    isAssigned,
  } = vehicle;

  return (
    <div className="max-w-5xl w-full bg-white rounded-xl shadow-xl p-8 mx-auto mt-12 ">
      <div className="flex justify-center mb-8">
        <img
          src={vehicleImgUrl}
          alt="Vehicle"
          className="w-40 h-40 rounded-full border-4 border-gray-200 shadow-lg"
        />
      </div>

      <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
        Vehicle Number: {numberPlate}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Vehicle Information */}
        <div className="space-y-4">
          <p className="text-lg text-gray-700 font-medium">
            <strong>Type:</strong> {vehicleType}
          </p>
          <p className="text-lg text-gray-700 font-medium">
            <strong>Capacity:</strong> {vehicleCapacity} kg
          </p>
          <p className="text-lg text-gray-700 font-medium">
            <strong>Fuel Type:</strong> {fuelType}
          </p>
          <p className="text-lg text-gray-700 font-medium">
            <strong>Mileage:</strong> {mileage} km
          </p>
        </div>

        {/* Dates Information */}
        <div className="space-y-4">
          <p className="text-lg text-gray-700 font-medium">
            <strong>Insurance Expiry:</strong>{" "}
            {new Date(insuranceExpiryDate).toLocaleDateString()}
          </p>
          <p className="text-lg text-gray-700 font-medium">
            <strong>License Date:</strong>{" "}
            {new Date(LicenedDate).toLocaleDateString()}
          </p>
          <p className="text-lg text-gray-700 font-medium">
            <strong>Last Service Date:</strong>{" "}
            {new Date(lastServiceDate).toLocaleDateString()}
          </p>
          <p className="text-lg text-gray-700 font-medium">
            <strong>Next Service Due:</strong>{" "}
            {new Date(nextServiceDue).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <p className="text-lg text-gray-700 font-medium">
          <strong>Status:</strong>
          <span
            className={
              status === "available" ? "text-green-500" : "text-red-500"
            }
          >
            {status}
          </span>
        </p>

        <p className="text-lg text-gray-700 font-medium">
          <strong>Assigned:</strong> {isAssigned ? "Yes" : "No"}
        </p>
      </div>
    </div>
  );
};

export default VehicleDetails;
