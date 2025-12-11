import api from "@/services/api";

export async function getMisPostulaciones() {
  return api.get("/postulaciones/mine");
}
