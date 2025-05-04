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
import { Badge } from "@components/ui/badge";
import Modal from "react-modal";
import { Close, Add, Directions, Check, Clear } from "@mui/icons-material";
import { motion } from "framer-motion";
import RouteMap from "../../components/admin/RouteMap";
import RouteManagement from "../../components/forms/RouteManagement";
import { deliverRouteApi } from "../../../api/deliverRoutes";
import { Skeleton } from "@components/ui/skeleton";

const RouteManager = ({ isSidebarCollapsed }) => {
  const [routeFormPopup, setRouteFormPopup] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [totalRoutes, setTotalRoutes] = useState(0);
  const [approvedRoutes, setApprovedRoutes] = useState(0);
  const [rejectedRoutes, setRejectedRoutes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [mapKey, setMapKey] = useState(Date.now());

  const closeRouteFormPopup = () => {
    setRouteFormPopup(false);
    setSelectedRoute(null);
    setMapKey(Date.now());
  };

  const openRouteFormPopup = (route = null) => {
    setSelectedRoute(route);
    setRouteFormPopup(true);
  };

  useEffect(() => {
    fetchAllDeliverRoutes();
  }, [routeFormPopup]);

  const fetchAllDeliverRoutes = async () => {
    setIsLoading(true);
    try {
      const routes = await deliverRouteApi.getAllRoutes();
      setRoutes(routes.data);
      setTotalRoutes(routes.data.length);
      setApprovedRoutes(
        routes.data.filter((v) => v.status === "Approved").length
      );
      setRejectedRoutes(
        routes.data.filter((v) => v.status === "Rejected").length
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <Check className="h-4 w-4 mr-1" />
            {status}
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <Clear className="h-4 w-4 mr-1" />
            {status}
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            {status}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {status}
          </Badge>
        );
    }
  };

  // Set app element for react-modal
  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

  return (
    <div>
      <main
        style={{
          marginLeft: isSidebarCollapsed ? "60px" : "220px",
          transition: "margin-left 0.3s",
        }}
        className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen"
      >
        <div className="px-20 py-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Route Management
              </h1>
              <p className="text-gray-600">
                Optimize and monitor delivery routes
              </p>
            </div>

            {/* Add New Route Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-6 py-3 rounded-lg shadow-md text-white flex items-center gap-2"
                onClick={() => openRouteFormPopup()}
              >
                <Add className="h-5 w-5" />
                <span>Add New Route</span>
              </Button>
            </motion.div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Routes
                    </p>
                    <h3 className="text-3xl font-bold mt-1">{totalRoutes}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <Directions className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Active Routes
                    </p>
                    <h3 className="text-3xl font-bold mt-1 text-green-600">
                      {totalRoutes}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <Check className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Disabled Routes
                    </p>
                    <h3 className="text-3xl font-bold mt-1 text-red-600">
                      {rejectedRoutes}
                    </h3>
                  </div>
                  <div className="p-3 rounded-full bg-red-100 text-red-600">
                    <Clear className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Section - Only show when modal is closed */}
          {!routeFormPopup && (
            <Card className="mb-6 border-0 shadow-sm" key={mapKey}>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Route Visualization
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 w-full rounded-lg overflow-hidden">
                  <RouteMap routes={routes} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Routes List Section */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                All Delivery Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-gray-700">
                        Route ID
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Start Point
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        End Point
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Distance
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
                    {routes.length > 0 ? (
                      routes.map((route) => (
                        <TableRow key={route._id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            #{route._id.slice(-6)}
                          </TableCell>
                          <TableCell>{route.startPoint}</TableCell>
                          <TableCell>{route.endPoint}</TableCell>
                          <TableCell>{route.distance} km</TableCell>
                          <TableCell>{getStatusBadge(route.status)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-gray-500"
                        >
                          No routes found. Create your first route to get
                          started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Route Form Modal */}
          <Modal
            isOpen={routeFormPopup}
            onRequestClose={closeRouteFormPopup}
            className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-auto my-8 outline-none"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            ariaHideApp={false}
            shouldCloseOnOverlayClick={false}
          >
            <div className="relative p-6">
              <button
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                onClick={closeRouteFormPopup}
              >
                <Close className="text-gray-500" />
              </button>

              <RouteManagement onSuccess={closeRouteFormPopup} />
            </div>
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default RouteManager;
