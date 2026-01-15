"use client";

import { useEffect, useState } from "react";

interface NFStatus {
  name: string;
  url: string;
  status: "online" | "offline" | "checking";
  port: number;
}

export default function Home() {
  const [nfStatuses, setNfStatuses] = useState<NFStatus[]>([
    { name: "NRF", url: "http://localhost:8082", status: "checking", port: 8082 },
    { name: "AUSF", url: "http://localhost:8081", status: "checking", port: 8081 },
    { name: "UDM", url: "http://localhost:8084", status: "checking", port: 8084 },
    { name: "NSSF", url: "http://localhost:8083", status: "checking", port: 8083 },
    { name: "AMF", url: "http://localhost:8086", status: "checking", port: 8086 },
    { name: "SMF", url: "http://localhost:8085", status: "checking", port: 8085 },
    { name: "UPF", url: "http://localhost:8087", status: "checking", port: 8087 },
  ]);

  useEffect(() => {
    const checkStatuses = async () => {
      const updatedStatuses = await Promise.all(
        nfStatuses.map(async (nf) => {
          try {
            const response = await fetch(`/api/health?url=${encodeURIComponent(nf.url)}`);
            const data = await response.json();
            return { ...nf, status: data.status };
          } catch {
            return { ...nf, status: "offline" as const };
          }
        })
      );
      setNfStatuses(updatedStatuses);
    };

    checkStatuses();
    const interval = setInterval(checkStatuses, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">5G Core Network</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Network Functions Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nfStatuses.map((nf) => (
                <div
                  key={nf.name}
                  className="bg-white overflow-hidden shadow rounded-lg border-2 border-gray-200"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{nf.name}</h3>
                        <p className="text-sm text-gray-500">Port: {nf.port}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {nf.status === "online" && (
                          <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {nf.status === "offline" && (
                          <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {nf.status === "checking" && (
                          <div className="h-8 w-8 bg-gray-400 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        nf.status === "online" ? "bg-green-100 text-green-800" :
                        nf.status === "offline" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {nf.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Network Information</h3>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">MCC</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">999</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">MNC</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">70</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">PLMN</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">99970</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">TAC</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">000001</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
