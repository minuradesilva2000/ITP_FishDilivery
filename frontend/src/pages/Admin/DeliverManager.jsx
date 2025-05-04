import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import VehiclesManagement from "../../components/forms/VehiclesManagement";
import Modal from "react-modal";
import { Close, Search, FilterAlt, PictureAsPdf } from "@mui/icons-material";
import { vehicleApi } from "../../../api/vehicles";
import { motion } from "framer-motion";
import { toast } from "../../../hooks/use-toast.js";
import Swal from "sweetalert2";
import VehicleDetails from "../../components/dataPopups/VehicleDetails";
import { Badge } from "@components/ui/badge";
import { PDFDownloadLink } from "@react-pdf/renderer";
import VehicleReportPDF from "../../components/reports/VehicleReportPDF";

const DeliverManager = ({ isSidebarCollapsed }) => {
  const [vehicleFormPopup, setVehicleFormPopup] = useState(false);
  const [vehicleDisplay, setVehicleDisplay] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState();
  const [vehicles, setVehicles] = useState([]);
  const [formType, setFormType] = useState("add");
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [approvedVehicles, setApprovedVehicles] = useState(0);
  const [rejectedVehicles, setRejectedVehicles] = useState(0);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    filterVehicles();
  }, [searchQuery, vehicleTypeFilter, vehicles]);

  useEffect(() => {
    fetchAllVehicles();
  }, [vehicleFormPopup]);

  const closeVehicleFormPopup = () => {
    setVehicleFormPopup(false);
    setFormType("add");
    setSelectedVehicle(null);
  };

  const openVehicleFormPopup = () => {
    setVehicleFormPopup(true);
  };

  const closeVehicleDisplayPopup = () => {
    setVehicleDisplay(false);
  };

  const openVehicleDisplayPopup = (vehicle) => {
    setVehicleDisplay(true);
    setSelectedVehicle(vehicle);
  };

  const handleVehicleUpdate = (vehicle) => {
    setFormType("edit");
    setSelectedVehicle(vehicle);
    setVehicleFormPopup(true);
  };

  const handleOnSubmit = (response, error) => {
    setVehicleFormPopup(false);

    if (error) {
      toast({
        title: "Error",
        description: "Error Adding New Vehicle!",
        variant: "destructive",
      });
      return;
    }

    if (response) {
      toast({
        title: "Success!",
        description: "Vehicle Added Successfully!",
        variant: "default",
      });
    }

    setFormType("add");
  };

  const fetchAllVehicles = async () => {
    setIsLoading(true);
    try {
      const vehicles = await vehicleApi.getAllVehicles();
      setVehicles(vehicles.data);
      setTotalVehicles(vehicles.data.length);
      setApprovedVehicles(
        vehicles.data.filter((v) => v.status === "Approved").length
      );
      setRejectedVehicles(
        vehicles.data.filter((v) => v.status === "Rejected").length
      );
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch vehicles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = vehicles;

    if (searchQuery) {
      filtered = filtered.filter((v) =>
        v.numberPlate.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (vehicleTypeFilter) {
      filtered = filtered.filter((v) => v.vehicleType === vehicleTypeFilter);
    }

    setFilteredVehicles(filtered);
  };

  const handleVehicleDelete = async (vehicleId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        customClass: {
          container: "z-50",
        },
      });

      if (result.isConfirmed) {
        await vehicleApi.deleteVehicle(vehicleId);
        fetchAllVehicles();
        Swal.fire({
          title: "Deleted!",
          text: "The vehicle has been removed.",
          icon: "success",
          customClass: {
            container: "z-50",
          },
        });
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to delete the vehicle.",
        icon: "error",
        customClass: {
          container: "z-50",
        },
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
        );
      case "Rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>;
      case "Pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
        );
    }
  };

  return (
    <div>
      <main
        style={{
          marginLeft: isSidebarCollapsed ? "60px" : "220px",
          transition: "margin-left 0.3s",
        }}
        className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen rounded-2xl"
      >
        <div className="px-20 py-6">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Vehicle Management
              </h1>
              <p className="text-gray-600">Manage your vehicles efficiently</p>
            </div>

            {/* Add New Vehicle Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-6 py-3 rounded-lg shadow-md text-white flex items-center gap-2"
                onClick={openVehicleFormPopup}
              >
                <span className="text-xl">+</span>
                <span>Add Vehicle</span>
              </Button>

              {filteredVehicles && (
                <PDFDownloadLink
                  document={
                    <VehicleReportPDF
                      vehicles={filteredVehicles}
                      totalVehicles={totalVehicles}
                      approvedVehicles={approvedVehicles}
                      rejectedVehicles={rejectedVehicles}
                    />
                  }
                  fileName={`vehicle-report-${new Date().toLocaleDateString(
                    "en-CA"
                  )}.pdf`}
                >
                  {({ loading }) => (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="default"
                        className="bg-red-600 hover:bg-red-700 mt-3 transition-all duration-300 px-6 py-3 rounded-lg shadow-md text-white flex items-center gap-2"
                        disabled={loading || filteredVehicles.length === 0}
                      >
                        <PictureAsPdf />
                        <span>
                          {loading ? "Preparing PDF..." : "Generate PDF"}
                        </span>
                      </Button>
                    </motion.div>
                  )}
                </PDFDownloadLink>
              )}
            </motion.div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Vehicles
                    </p>
                    <h3 className="text-3xl font-bold mt-1">{totalVehicles}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      In Delivery
                    </p>
                    <h3 className="text-3xl font-bold mt-1 text-green-600">
                      {approvedVehicles}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      In Maintanace
                    </p>
                    <h3 className="text-3xl font-bold mt-1 text-red-600">
                      {rejectedVehicles}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-red-100 text-red-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters Section */}
          <Card className="mb-6 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by number plate..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FilterAlt className="text-gray-400" />
                  </div>
                  <select
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition-all"
                    value={vehicleTypeFilter}
                    onChange={(e) => setVehicleTypeFilter(e.target.value)}
                  >
                    <option value="">All Vehicle Types</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Car">Car</option>
                    <option value="Motorcycle">Motorcycle</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Vehicle Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold text-gray-700">
                          Number Plate
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Type
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Capacity
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Fuel Type
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Mileage
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Status
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVehicles.length > 0 ? (
                        filteredVehicles.map((vehicle) => (
                          <TableRow
                            key={vehicle._id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="font-medium">
                              {vehicle.numberPlate}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="border-blue-200 text-blue-700"
                              >
                                {vehicle.vehicleType}
                              </Badge>
                            </TableCell>
                            <TableCell>{vehicle.vehicleCapacity} kg</TableCell>
                            <TableCell>{vehicle.fuelType}</TableCell>
                            <TableCell>{vehicle.mileage} km</TableCell>
                            <TableCell>
                              {getStatusBadge(vehicle.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all"
                                  onClick={() =>
                                    openVehicleDisplayPopup(vehicle)
                                  }
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border-green-300 text-green-600 hover:bg-green-50 hover:text-green-700 transition-all"
                                  onClick={() => handleVehicleUpdate(vehicle)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
                                  onClick={() =>
                                    handleVehicleDelete(vehicle._id)
                                  }
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-8 text-gray-500"
                          >
                            No vehicles found. Try adjusting your search
                            filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Modals */}
          <Modal
            isOpen={vehicleFormPopup}
            onRequestClose={closeVehicleFormPopup}
            className="bg-white rounded-xl shadow-xl w-full max-w-6xl mx-auto my-8 outline-none"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            ariaHideApp={false}
          >
            <div className="relative p-6">
              <button
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                onClick={closeVehicleFormPopup}
              >
                <Close className="text-gray-500" />
              </button>

              {formType === "add" ? (
                <VehiclesManagement
                  type={formType}
                  vehicle={null}
                  onSubmit={handleOnSubmit}
                />
              ) : (
                <VehiclesManagement
                  type={formType}
                  vehicle={selectedVehicle}
                  onSubmit={handleOnSubmit}
                />
              )}
            </div>
          </Modal>

          <Modal
            isOpen={vehicleDisplay}
            onRequestClose={closeVehicleDisplayPopup}
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-auto my-8 outline-none"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            ariaHideApp={false}
          >
            <div className="relative p-6">
              <button
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                onClick={closeVehicleDisplayPopup}
              >
                <Close className="text-gray-500" />
              </button>
              <VehicleDetails vehicle={selectedVehicle} />
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default DeliverManager;
