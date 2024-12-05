import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, CircularProgress } from "@nextui-org/react";
import { User, Mail, Search } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TerceroAutocomplete from "./TerceroAutocomplete";
import SpecialistAutocomplete from "./SpecialistAutocomplete";

export function Nuevoticket() {
  const [descripcionValue, setDescripcionValue] = useState("");
  const [solucionValue, setSolucionValue] = useState("");
  const [topics, setTopics] = useState([]);
  const [users, setUsers] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedStatus] = useState({
    id: 1,
    name: "Creado",
  });
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState(null);

  const [descripcionImages, setDescripcionImages] = useState([]);
  const [solucionImages, setSolucionImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topicsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/topics`
        );
        setTopics(topicsResponse.data.topics);

        const usuariosResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tercerosda`
        );

        if (!usuariosResponse.ok) {
          throw new Error("Error al obtener usuarios");
        }

        const data = await usuariosResponse.json();
        setUsuarios(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar los datos. Por favor, recarga la página.");
      }
    };

    fetchData();
  }, []);

  const handleImageUpload = (files, setter) => {
    const filePromises = Array.from(files).map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then((base64Images) => {
      setter((prevImages) => [...prevImages, ...base64Images]);
    });
  };

  const handleDrop = (event, setter) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    handleImageUpload(files, setter);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSeleccionTercero = (usuario) => {
    setUsuarioSeleccionado(usuario);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedTopic || !usuarioSeleccionado || !selectedUser) {
        toast.error("Por favor, selecciona todos los campos necesarios.");
        return;
      }

      setIsLoading(true);

      const ticketData = {
        fecha_creacion: new Date().toISOString(),
        tema: selectedTopic.name,
        estado: selectedStatus.name,
        tercero_nombre: usuarioSeleccionado.fullName,
        tercero_email: usuarioSeleccionado.email,
        especialista_nombre: selectedUser.fullName,
        especialista_email: selectedUser.email,
        descripcion_caso: descripcionValue,
        solucion_caso: solucionValue,
        descripcion_images: descripcionImages,
        solucion_images: solucionImages,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets/register`,
        ticketData
      );

      if (response.status === 201) {
        toast.success("Ticket creado exitosamente");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error("Error al crear el ticket:", error);
      toast.error("Error al crear el ticket. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg">{error}</div>
    );
  }

  return (
    <div className="bg-gray-50  flex items-center justify-center p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="bg-white shadow-2xl rounded-2xl w-5/6 p-8 ">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-[#4a53a0]">
            Crear Nuevo Ticket
          </h2>
          <p className="text-gray-500 mt-2">
            Complete todos los campos para registrar su ticket
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna Izquierda: Información Principal */}
          <div className="space-y-6">
            {/* Tema del Ticket */}
            <div>
              <label className="block text-[#4a53a0] font-semibold mb-2">
                Tema del Ticket
              </label>
              <select
                value={selectedTopic?.name || ""}
                onChange={(e) => {
                  const selected = topics.find(
                    (t) => t.name === e.target.value
                  );
                  setSelectedTopic(selected);
                }}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="">Seleccionar Tema</option>
                {topics.map((topic) => (
                  <option key={topic.name} value={topic.name}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado del Ticket */}
            <div>
              <label className="block text-[#4a53a0] font-semibold mb-2">
                Estado del Ticket
              </label>
              <input
                type="text"
                value="Creado"
                readOnly
                className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700"
              />
            </div>

            {/* Tercero */}
            <div className="text-black">
              <label className="block text-[#4a53a0] font-semibold mb-2">
                Tercero
              </label>
              <TerceroAutocomplete
                usuarios={usuarios}
                onSelect={handleSeleccionTercero}
              />
            </div>

            {/* Detalles del Tercero */}
            {usuarioSeleccionado && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg text-black">
                <h3 className="text-lg font-bold text-blue-800 mb-3">
                  Detalles del Tercero
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Mail className="mr-3 text-blue-600" />
                    <span className="text-gray-700">
                      {usuarioSeleccionado.email}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <User className="mr-3 text-green-600" />
                    <span className="text-gray-700">
                      {usuarioSeleccionado.fullName}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Especialista */}
            <div className="text-black">
              <label className="block text-[#4a53a0] font-semibold mb-2">
                Especialista
              </label>
              <SpecialistAutocomplete
                onSelect={(specialist) => {
                  setSelectedUser(specialist);
                  setSelectedUserEmail(specialist.email);
                }}
              />
              {selectedUserEmail && (
                <p className="text-sm text-gray-500 mt-2">
                  Correo: {selectedUserEmail}
                </p>
              )}
            </div>
          </div>

          {/* Columna Derecha: Descripción y Solución */}
          <div className="md:col-span-2 space-y-6 text-black">
            {/* Descripción del Caso */}
            <div>
              <label className="block text-[#4a53a0] font-semibold mb-2">
                Descripción del Caso
              </label>
              <div
                onDrop={(e) => handleDrop(e, setDescripcionImages)}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4"
              >
                <textarea
                  className="w-full h-48 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={descripcionValue}
                  onChange={(e) => setDescripcionValue(e.target.value)}
                  placeholder="Describe el caso detalladamente..."
                />

                {/* Image Upload Section */}
                <div className="mt-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(e.target.files, setDescripcionImages)
                    }
                    className="hidden"
                    id="descripcionImageInput"
                  />
                  <label
                    htmlFor="descripcionImageInput"
                    className="block text-center p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition"
                  >
                    + Añadir imágenes
                  </label>

                  {/* Uploaded Images Preview */}
                  {descripcionImages.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {descripcionImages.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Uploaded ${index}`}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botón de Crear Ticket */}
            <div className="mt-6">
              <Button
                onClick={handleSubmit}
                className="w-full bg-[#4a53a0] text-white py-4 text-lg rounded-xl hover:bg-[#666eb5] transition duration-300 ease-in-out"
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress
                    size="sm"
                    color="current"
                    aria-label="Creando ticket..."
                  />
                ) : (
                  "Crear Ticket"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Nuevoticket;
