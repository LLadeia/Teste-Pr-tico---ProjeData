import api from "./api";

export const getCanProduce = () =>
  api.get("/api/production/can-produce/");

export const produceProduct = (productId, quantity) =>
  api.post(`/api/products/${productId}/produce/`, {
    quantity,
  });
