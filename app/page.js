"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import React from "react";

export default function Home() {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState("zero@zilla.com");
  const [password, setPassword] = useState("password123");
  const [agencies, setAgencies] = useState([]);

  const [inputValues, setinputValues] = useState({
    agencyName: "BluePrint Tech",
    agencyAddress: "123 Jaynagar",
    agencyState: "Karnataka",
    agencyCity: "Bangalore",
    agencyPhoneNumber: "1234567890",
    clientName: "ZeroZilla",
    clientEmail: "zerozilla@gmail.com",
    clientPhoneNumber: "9876543210",
    clientTotalBill: 5000,
  });

  const apiURL = "http://localhost:5000/api/";

  const fetchClients = async () => {
    try {
      const res = await axios.get(apiURL + "clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
      setClients(res.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (!!token) {
      fetchClients();
    }
  }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post(apiURL + "auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      alert("Login successful");
    } catch (err) {
      alert("Login failed");
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      setToken(null);
      alert("Logout successful");
    } catch (err) {
      alert("Logout failed");
    }
  };

  const fetchTopClients = async () => {
    try {
      const res = await axios.get(apiURL + "clients/top-clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
      setAgencies(res.data);
    } catch (err) {
      alert("Failed to fetch clients");
    }
  };

  // {
  //   agency: {
  //     name: "ABC Marketing",
  //     address1: "123 Street",
  //     state: "California",
  //     city: "Los Angeles",
  //     phoneNumber: "1234567890",
  //   },
  //   client: {
  //     name: "Michael Smith",
  //     email: "michaedl@example.com",
  //     phoneNumber: "9876543210",
  //     totalBill: 5000,
  //   },
  // },

  const handleCreateAgencyClient = async () => {
    const {
      agencyName,
      agencyAddress,
      agencyState,
      agencyCity,
      agencyPhoneNumber,
      clientName,
      clientEmail,
      clientPhoneNumber,
      clientTotalBill,
    } = inputValues;

    // Check for empty fields
    if (
      !agencyName ||
      !agencyAddress ||
      !agencyState ||
      !agencyCity ||
      !agencyPhoneNumber ||
      !clientName ||
      !clientEmail ||
      !clientPhoneNumber ||
      !clientTotalBill
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // Ensure total bill is a valid number
    const totalBill = Number(clientTotalBill);
    if (isNaN(totalBill) || totalBill < 0) {
      alert("Total bill must be a valid non-negative number.");
      return;
    }

    try {
      const res = await axios.post(
        apiURL + "agencies",
        {
          agency: {
            name: inputValues.agencyName,
            address1: inputValues.agencyAddress,
            state: inputValues.agencyState,
            city: inputValues.agencyCity,
            phoneNumber: inputValues.agencyPhoneNumber,
          },
          client: {
            name: inputValues.clientName,
            email: inputValues.clientEmail,
            phoneNumber: inputValues.clientPhoneNumber,
            totalBill: Number(inputValues.clientTotalBill), // Ensure it's a number
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchClients();
      alert("Agency & Client created successfully");
      console.log("Response:", res.data);
    } catch (err) {
      alert("Failed to create agency & client. Try changing the email");
    }
  };

  const handleGetAgenciesAndClients = async () => {
    try {
      const res = await axios.get(apiURL + "api/agencies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
      alert("Agencies & Clients received successfully");
    } catch (err) {
      alert("Failed to create agency & client");
    }
  };

  const deleteClient = async (clientId) => {
    try {
      await axios.delete(apiURL + `clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClients();
      alert("Client deleted successfully!");
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Failed to delete client.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setinputValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const [editClient, setEditClient] = useState({});

  const handleChange = (e, clientId) => {
    const { name, value } = e.target;
    setEditClient((prev) => ({
      ...prev,
      [clientId]: { ...prev[clientId], [name]: value },
    }));
  };

  const handleUpdateClient = async (clientId) => {
    console.log(editClient), clientId;
    if (!editClient[clientId]) {
      alert("No changes made.");
      return;
    }

    try {
      const res = await axios.put(
        apiURL + `clients/${clientId}`,
        editClient[clientId], // Send only the edited fields
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setClients((prevClients) =>
        prevClients.map((client) =>
          client._id === clientId ? { ...client, ...res.data } : client
        )
      );

      // Clear the edited fields for that client
      setEditClient((prev) => {
        const updatedState = { ...prev };
        delete updatedState[clientId]; // Remove the updated client from edit state
        return updatedState;
      });

      alert("Client updated successfully");
    } catch (err) {
      console.error("Error updating client:", err);
      alert("Failed to update client");
    }
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 ">
      <main className="flex flex-col gap-8 row-start-2 justify-center items-center sm:items-start">
        <div className="p-4">
          {!token ? (
            <div className="flex flex-col ">
              <div className="flex items-center justify-center">
                <ol className="flex items-center justify-center mb-2 list-inside list-decimal text-lg text-center sm:text-left ">
                  Login
                </ol>
              </div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
              />{" "}
              <button
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent h-10 sm:min-w-44"
                onClick={handleLogin}
              >
                Login
              </button>
            </div>
          ) : (
            <div className="flex flex-col ">
              <div className="flex items-center justify-center">
                <ol className="flex items-center justify-center mb-2 list-inside list-decimal text-lg text-center sm:text-left ">
                  Dashboard
                </ol>
              </div>

              <div className="rounded-sm border border-solid border-black/[.08] dark:border-white/[.145] flex flex-col   p-4 m-5">
                <div>
                  <h2 className="text-center">Create Agency & Client</h2>
                  <h6 className="text-center text-xs text-gray-500">
                    As Stated Agency and Client can be created together below
                  </h6>
                </div>
                <label className="text-sm">Agency Name</label>
                <input
                  className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
                  type="text"
                  name="agencyName"
                  value={inputValues.agencyName}
                  onChange={handleInputChange}
                  placeholder="Agency Name"
                />
                <label className="text-sm">Agency Address</label>
                <input
                  type="text"
                  className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
                  name="agencyAddress"
                  value={inputValues.agencyAddress}
                  onChange={handleInputChange}
                  placeholder="Agency Address"
                />

                <label className="text-sm">State</label>

                <input
                  className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
                  type="text"
                  name="agencyState"
                  value={inputValues.agencyState}
                  onChange={handleInputChange}
                  placeholder="State"
                />

                <label className="text-sm">City</label>

                <input
                  className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
                  type="text"
                  name="agencyCity"
                  value={inputValues.agencyCity}
                  onChange={handleInputChange}
                  placeholder="City"
                />

                <label className="text-sm">Phone Number</label>

                <input
                  className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
                  type="text"
                  name="agencyPhoneNumber"
                  value={inputValues.agencyPhoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                />

                <label className="text-sm">Agency Address</label>

                <input
                  className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
                  type="text"
                  name="clientName"
                  value={inputValues.clientName}
                  onChange={handleInputChange}
                  placeholder="Client Name"
                />
                <label className="text-sm">Client Email</label>
                <input
                  className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
                  type="email"
                  name="clientEmail"
                  value={inputValues.clientEmail}
                  onChange={handleInputChange}
                  placeholder="Client Email"
                />
                <label className="text-sm">Client Phone Number</label>
                <input
                  className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
                  type="text"
                  name="clientPhoneNumber"
                  value={inputValues.clientPhoneNumber}
                  onChange={handleInputChange}
                  placeholder="Client Phone Number"
                />
                <label className="text-sm">Total Bill</label>
                <input
                  className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
                  type="number"
                  name="clientTotalBill"
                  value={inputValues.clientTotalBill}
                  onChange={handleInputChange}
                  placeholder="Total Bill"
                />
                <button
                  className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent h-10 sm:min-w-44 p-4"
                  onClick={handleCreateAgencyClient}
                >
                  Create Agency & Client
                </button>
                <div className="text-center m-3">
                  Remember that email is defined as a unique property
                </div>
              </div>

              <div className="rounded-sm border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex flex-col p-2 m-5">
                <div>
                  <h2 className="text-center">All Client details</h2>
                  <h6 className="text-center text-xs text-gray-500">
                    This section allows you to update and delete client details.
                    Since Creation is done in agency-client pairs, deletion will
                    delete the pair for the same.
                  </h6>
                </div>
                {clients.map((client) => (
                  <div key={client._id} className="m-2">
                    <h3>
                      {client.name} - {client.agencyId?.name}
                    </h3>
                    <input
                      className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
                      type="text"
                      name="name"
                      placeholder="Client Name"
                      value={editClient[client._id]?.name || client.name}
                      onChange={(e) => handleChange(e, client._id)}
                    />
                    <input
                      className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
                      type="number"
                      name="totalBill"
                      placeholder="Total Bill"
                      value={
                        editClient[client._id]?.totalBill || client.totalBill
                      }
                      onChange={(e) => handleChange(e, client._id)}
                    />
                    <input
                      className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={editClient[client._id]?.email || client.email}
                      onChange={(e) => handleChange(e, client._id)}
                    />
                    <input
                      className="p-2 rounded-lg shadow-md w-full h-8 mb-2 border dark:xbg-zinc-800 bg-transparent placeholder:text-white dark:border-zinc-600 dark:focus:border-zinc-200  border-gray-300 focus:border-slate-200 outline-none"
                      type="text"
                      name="phoneNumber"
                      placeholder="Phone Number"
                      value={
                        editClient[client._id]?.phoneNumber ||
                        client.phoneNumber
                      }
                      onChange={(e) => handleChange(e, client._id)}
                    />
                    <div className="flex gap-2 justify-center">
                      <button
                        className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent h-10 sm:min-w-44 p-4"
                        onClick={() => {
                          handleUpdateClient(client._id, editClient);
                        }}
                      >
                        Update Client
                      </button>
                      <button
                        className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent h-10 sm:min-w-44 p-4"
                        onClick={() => {
                          deleteClient(client._id);
                        }}
                      >
                        Delete Client
                      </button>{" "}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-sm border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex flex-col p-2 m-5">
                <div className="mb-4">
                  <h2 className="text-center">Get Top Client</h2>
                  <h6 className="text-center text-xs text-gray-500">
                    Get the Client with the highest total bill and its
                    corresponding AGency
                  </h6>
                </div>
                <button
                  className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent h-10 sm:min-w-44 p-4"
                  onClick={fetchTopClients}
                >
                  Fetch Top Client
                </button>
                <div>
                  {!!agencies && agencies.hasOwnProperty("AgencyName") ? (
                    <div>
                      <h3>
                        {" "}
                        Agency Name:{" "}
                        <span className="text-blue-600">
                          {agencies.AgencyName}
                        </span>{" "}
                        with TotalAgencyBill:{" "}
                        <span className="text-blue-600">
                          {agencies.TotalAgencyBill}
                        </span>{" "}
                      </h3>

                      <div>
                        {!!agencies.Clients &&
                          agencies.Clients.map((client, index) => (
                            <div key={client.ClientName + client.TotalBill}>
                              <div className="">
                                Client Name: {client.ClientName}
                              </div>{" "}
                              <div className="">
                                Client TotalBill: {client.TotalBill}
                              </div>{" "}
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center m-2">
                      Hit the button to see the top clients
                    </div>
                  )}
                </div>
              </div>
              {/* 
              <button
                className="mb-4 rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent h-10 sm:min-w-44 p-4"
                onClick={handleGetAgenciesAndClients}
              >
                Retrieve All Agencies & Clients in console
              </button> */}
              <div className="text-sm text-gray-500 rounded-sm border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex flex-col p-2 m-5">
                Note: Solution is adhered to the requirements of the task
                roughly subdivided into 3 tasks as stated in the task
                description's problem statement.
              </div>

              <button
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent h-10 sm:min-w-44 p-4 mb-2"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
