import React, { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import LeftImg from "../../assets/images/web-tyre-case.jpg";
import { Stepper, Step, StepLabel } from "@mui/material";
import { vehicleApi } from "../../../api/vehicles";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../../lib/firebase.js";
import LoadingScreen from "../../components/ui/loadingScreen.jsx";

const steps = ["Vehicle Details", "Insurance & Service", "Confirm & Submit"];

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Sri Lanka specific validation patterns
const VALIDATION_PATTERNS = {
  numberPlate: /^[A-Z]{2,3}\s?\d{4}$/i, // Sri Lankan number plate format (e.g., ABC-1234 or AB-1234)
  vehicleCapacity: /^\d+$/, // Only numbers
  mileage: /^\d+$/, // Only numbers
  fuelType: /^(Petrol|Diesel|Electric|Hybrid|CNG)$/i,
};

const VehiclesManagement = ({ type, vehicle, onSubmit }) => {
  const [formData, setFormData] = useState({
    numberPlate: vehicle?.numberPlate || "",
    vehicleType: vehicle?.vehicleType || "",
    vehicleCapacity: vehicle?.vehicleCapacity || "",
    fuelType: vehicle?.fuelType || "",
    mileage: vehicle?.mileage || "",
    insuranceExpiryDate: formatDate(vehicle?.insuranceExpiryDate) || "",
    LicenedDate: formatDate(vehicle?.LicenedDate) || "",
    lastServiceDate: formatDate(vehicle?.lastServiceDate) || "",
    nextServiceDue: formatDate(vehicle?.nextServiceDue) || "",
    vehicleImgUrl: vehicle?.vehicleImgUrl || "",
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [image, setImage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageURL, setImageURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const storage = getStorage(app);

  // Validate form fields
  const validateField = (name, value) => {
    let error = "";

    if (!value) {
      error = "This field is required";
    } else {
      switch (name) {
        case "numberPlate":
          if (!VALIDATION_PATTERNS.numberPlate.test(value)) {
            error = "Invalid format (e.g., ABC-1234 or AB-1234)";
          }
          break;
        case "vehicleCapacity":
          if (!VALIDATION_PATTERNS.vehicleCapacity.test(value)) {
            error = "Must be a number";
          } else if (parseInt(value) <= 0) {
            error = "Capacity must be positive";
          }
          break;
        case "mileage":
          if (!VALIDATION_PATTERNS.mileage.test(value)) {
            error = "Must be a number";
          } else if (parseInt(value) <= 0) {
            error = "Mileage must be positive";
          }
          break;
        case "fuelType":
          if (!VALIDATION_PATTERNS.fuelType.test(value)) {
            error = "Invalid fuel type";
          }
          break;
        case "insuranceExpiryDate":
        case "LicenedDate":
        case "lastServiceDate":
        case "nextServiceDue":
          if (new Date(value) < new Date()) {
            error = "Date cannot be in the past";
          }
          break;
      }
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validate the field
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 0) {
      // Validate step 1 fields
      [
        "numberPlate",
        "vehicleType",
        "vehicleCapacity",
        "fuelType",
        "mileage",
      ].forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });
    } else if (step === 1) {
      // Validate step 2 fields
      [
        "insuranceExpiryDate",
        "LicenedDate",
        "lastServiceDate",
        "nextServiceDue",
      ].forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleUpload = () => {
    if (!image) {
      setErrors((prev) => ({ ...prev, image: "Please select an image" }));
      return;
    }

    const storage = getStorage();
    const storageRef = ref(storage, `item_images/${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    setLoading(true);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (uploadError) => {
        console.error("Error uploading image:", uploadError);
        setLoading(false);
        setErrors((prev) => ({ ...prev, image: "Failed to upload image" }));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImageURL(downloadURL);
          setFormData((prev) => ({
            ...prev,
            vehicleImgUrl: downloadURL,
          }));
          setLoading(false);
          setErrors((prev) => ({ ...prev, image: "" }));
        } catch (error) {
          console.error("Error getting download URL:", error);
          setErrors((prev) => ({
            ...prev,
            image: "Error getting the download URL",
          }));
          setLoading(false);
        }
      }
    );
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    if (!formData.vehicleImgUrl) {
      setErrors((prev) => ({ ...prev, image: "Please upload an image" }));
      return;
    }

    try {
      setIsLoading(true);
      let response = null;

      if (type === "add") {
        response = await vehicleApi.createNewVehicle(formData);
      } else if (type === "edit") {
        response = await vehicleApi.updateVehicleData(formData, vehicle._id);
      }
      onSubmit(response);
    } catch (error) {
      console.error(error);
      onSubmit(null, error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepOne = () => (
    <>
      <div className="space-y-4">
        <div className="text-left">
          <Label>Vehicle No:</Label>
          <Input
            name="numberPlate"
            value={formData.numberPlate}
            onChange={handleInputChange}
            placeholder="Enter Vehicle No (e.g., ABC-1234)"
            required
            className={errors.numberPlate ? "border-red-500" : ""}
          />
          {errors.numberPlate && (
            <p className="text-red-500 text-sm mt-1">{errors.numberPlate}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-10">
          <div className="text-left">
            <Label>Vehicle Type:</Label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleInputChange}
              className={`flex h-10 w-full rounded-md border border-input bg-blue-50 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                errors.vehicleType ? "border-red-500" : ""
              }`}
              required
            >
              <option value="">Select Vehicle Type</option>
              <option value="bike">Bike</option>
              <option value="three_wheel">Three Wheel</option>
              <option value="diesel_wheel">Diesel Wheel</option>
              <option value="lorry">Lorry</option>
            </select>
            {errors.vehicleType && (
              <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>
            )}
          </div>
          <div className="text-left">
            <Label>Vehicle Capacity (kg):</Label>
            <Input
              name="vehicleCapacity"
              type="number"
              value={formData.vehicleCapacity}
              onChange={handleInputChange}
              placeholder="Enter Vehicle Capacity"
              required
              className={errors.vehicleCapacity ? "border-red-500" : ""}
            />
            {errors.vehicleCapacity && (
              <p className="text-red-500 text-sm mt-1">
                {errors.vehicleCapacity}
              </p>
            )}
          </div>
        </div>
        <div className="text-left">
          <Label>Fuel Type:</Label>

          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleInputChange}
            className={`flex h-10 w-full rounded-md border border-input bg-blue-50 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
              errors.fuelType ? "border-red-500" : ""
            }`}
            required
          >
            <option value="">Select Fuel Type</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
          </select>
          {errors.fuelType && (
            <p className="text-red-500 text-sm mt-1">{errors.fuelType}</p>
          )}
        </div>
        <div className="text-left">
          <Label>Mileage (km):</Label>
          <Input
            name="mileage"
            type="number"
            value={formData.mileage}
            onChange={handleInputChange}
            placeholder="Enter Mileage"
            required
            className={errors.mileage ? "border-red-500" : ""}
          />
          {errors.mileage && (
            <p className="text-red-500 text-sm mt-1">{errors.mileage}</p>
          )}
        </div>
      </div>

      <Button onClick={nextStep} className="bg-green-300 mt-10">
        Next
      </Button>
    </>
  );

  const renderStepTwo = () => (
    <>
      <div className="space-y-4">
        <div className="text-left">
          <Label>Insurance Expiry Date:</Label>
          <Input
            type="date"
            name="insuranceExpiryDate"
            value={formData.insuranceExpiryDate}
            onChange={handleInputChange}
            required
            className={errors.insuranceExpiryDate ? "border-red-500" : ""}
          />
          {errors.insuranceExpiryDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.insuranceExpiryDate}
            </p>
          )}
        </div>
        <div className="text-left">
          <Label>Licensed Date:</Label>
          <Input
            type="date"
            name="LicenedDate"
            value={formData.LicenedDate}
            onChange={handleInputChange}
            required
            className={errors.LicenedDate ? "border-red-500" : ""}
          />
          {errors.LicenedDate && (
            <p className="text-red-500 text-sm mt-1">{errors.LicenedDate}</p>
          )}
        </div>
        <div className="text-left">
          <Label>Last Service Date:</Label>
          <Input
            type="date"
            name="lastServiceDate"
            value={formData.lastServiceDate}
            onChange={handleInputChange}
            required
            className={errors.lastServiceDate ? "border-red-500" : ""}
          />
          {errors.lastServiceDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.lastServiceDate}
            </p>
          )}
        </div>
        <div className="text-left">
          <Label>Next Service Due:</Label>
          <Input
            type="date"
            name="nextServiceDue"
            value={formData.nextServiceDue}
            onChange={handleInputChange}
            required
            className={errors.nextServiceDue ? "border-red-500" : ""}
          />
          {errors.nextServiceDue && (
            <p className="text-red-500 text-sm mt-1">{errors.nextServiceDue}</p>
          )}
        </div>
      </div>
      <div className="flex justify-between mt-10">
        <Button onClick={prevStep} className="bg-gray-300">
          Back
        </Button>
        <Button onClick={nextStep} className="bg-green-300">
          Next
        </Button>
      </div>
    </>
  );

  const renderStepThree = () => (
    <>
      <div className="space-y-4">
        <div className="text-left">
          <Label>Vehicle Image:</Label>
          <Input
            type="file"
            name="image"
            onChange={(e) => {
              setImage(e.target.files[0]);
              setErrors((prev) => ({ ...prev, image: "" }));
            }}
            accept="image/*"
            required
            className={errors.image ? "border-red-500" : ""}
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image}</p>
          )}
        </div>
        {uploadProgress > 0 && (
          <div className="w-full max-w-sm mt-4">
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold inline-block py-1 px-2 rounded text-teal-600 bg-teal-200">
                  Upload Progress
                </span>
                <span className="text-xs font-semibold inline-block py-1 px-2 rounded text-teal-600 bg-teal-200">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="flex-1">
                <div className="relative flex items-center justify-center w-full">
                  <div className="w-full bg-gray-200 rounded">
                    <div
                      className="bg-teal-600 text-xs leading-none py-1 text-center text-white rounded"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center mb-4">
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-black text-white text-xl px-4 py-2 rounded-md mt-5"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
      <div className="flex justify-between mt-10">
        <Button onClick={prevStep} className="bg-gray-300">
          Back
        </Button>
        <Button
          className="bg-blue-500 text-white"
          onClick={handleSubmit}
          disabled={!formData.vehicleImgUrl}
        >
          Submit
        </Button>
      </div>
    </>
  );

  return (
    <div className="w-5xl grid grid-cols-2 gap-5 h-full">
      {isLoading && (
        <LoadingScreen message={"Inquiry Application Submitting...."} />
      )}
      <img src={LeftImg} className="rounded-l-2xl h-full object-cover" />
      <div className="p-10 flex flex-col justify-center w-full">
        <h2 className="font-extrabold text-3xl mb-8">Vehicles Management</h2>

        <Stepper activeStep={step} alternativeLabel className="mb-2">
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 0 && renderStepOne()}
        {step === 1 && renderStepTwo()}
        {step === 2 && renderStepThree()}
      </div>
    </div>
  );
};

export default VehiclesManagement;
