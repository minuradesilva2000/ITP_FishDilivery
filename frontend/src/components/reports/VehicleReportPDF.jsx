import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Create enhanced styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#FFF",
    fontFamily: "Helvetica",
    position: "relative",
  },
  header: {
    marginBottom: 25,
    textAlign: "center",
    borderBottom: "1px solid #E5E7EB",
    paddingBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "extrabold",
    marginBottom: 5,
    color: "#1E40AF",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
    letterSpacing: 1,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: "contain",
  },
  reportInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  reportDate: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "right",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  statBox: {
    width: "32%",
    padding: 15,
    backgroundColor: "#F8FAFC",
    borderRadius: 5,
    border: "1px solid #E5E7EB",
  },
  statTitle: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 5,
    fontWeight: "medium",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tableContainer: {
    marginTop: 15,
    border: "1px solid #E5E7EB",
    borderRadius: 5,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    color: "#FFF",
    paddingVertical: 8,
    fontSize: 10,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    fontSize: 9,
    borderBottom: "1px solid #E5E7EB",
  },
  evenRow: {
    backgroundColor: "#F9FAFB",
  },
  col1: { width: "15%", paddingLeft: 8 },
  col2: { width: "15%", paddingLeft: 8 },
  col3: { width: "15%", paddingLeft: 8 },
  col4: { width: "15%", paddingLeft: 8 },
  col5: { width: "15%", paddingLeft: 8 },
  col6: { width: "15%", paddingLeft: 8 },
  statusApproved: {
    color: "#10B981",
    fontWeight: "bold",
  },
  statusRejected: {
    color: "#EF4444",
    fontWeight: "bold",
  },
  statusPending: {
    color: "#F59E0B",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 9,
    color: "#6B7280",
    paddingTop: 10,
    borderTop: "1px solid #E5E7EB",
  },
  pageNumber: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#9CA3AF",
  },
});

const VehicleReportPDF = ({
  vehicles = [],
  totalVehicles = 0,
  approvedVehicles = 0,
  rejectedVehicles = 0,
}) => {
  // Current date formatting
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Ensure vehicles is always an array
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with logo and title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {/* Replace with your actual logo path */}
            <Image style={styles.logo} src="/path/to/your/logo.png" />
          </View>
          <Text style={styles.title}>Vehicle Inventory Report</Text>
          <Text style={styles.subtitle}>Fish Delivary System</Text>
        </View>

        {/* Report metadata */}
        <View style={styles.reportInfo}>
          <View>
            <Text style={styles.reportDate}>Generated on: {currentDate}</Text>
            <Text style={styles.reportDate}>
              Total Records: {safeVehicles.length}
            </Text>
          </View>
        </View>

        {/* Statistics cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>TOTAL VEHICLES</Text>
            <Text style={styles.statValue}>{totalVehicles}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>ACTIVE VEHICLES</Text>
            <Text style={[styles.statValue, styles.statusApproved]}>
              {approvedVehicles}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>INACTIVE VEHICLES</Text>
            <Text style={[styles.statValue, styles.statusRejected]}>
              {rejectedVehicles}
            </Text>
          </View>
        </View>

        {/* Vehicles table */}
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>PLATE NO.</Text>
            <Text style={styles.col2}>TYPE</Text>
            <Text style={styles.col3}>CAPACITY</Text>
            <Text style={styles.col4}>FUEL TYPE</Text>
            <Text style={styles.col5}>MILEAGE</Text>
            <Text style={styles.col6}>STATUS</Text>
          </View>

          {/* Table Rows */}
          {safeVehicles.map((vehicle, index) => (
            <View
              key={index}
              style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}
            >
              <Text style={styles.col1}>{vehicle?.numberPlate || "N/A"}</Text>
              <Text style={styles.col2}>{vehicle?.vehicleType || "N/A"}</Text>
              <Text style={styles.col3}>
                {vehicle?.vehicleCapacity
                  ? `${vehicle.vehicleCapacity} kg`
                  : "N/A"}
              </Text>
              <Text style={styles.col4}>{vehicle?.fuelType || "N/A"}</Text>
              <Text style={styles.col5}>
                {vehicle?.mileage ? `${vehicle.mileage} km` : "N/A"}
              </Text>
              <Text
                style={[
                  styles.col6,
                  vehicle?.status === "Approved"
                    ? styles.statusApproved
                    : vehicle?.status === "Rejected"
                    ? styles.statusRejected
                    : styles.statusPending,
                ]}
              >
                {vehicle?.status || "Pending"}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Confidential - For internal use only</Text>
          <Text>
            © {new Date().getFullYear()} Fish Delivary System. All rights
            reserved.
          </Text>
        </View>

        {/* Page number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default VehicleReportPDF;
