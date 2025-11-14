import { useEffect } from "react";
import Layout from "../Components/Layout";
import PaymentManagement from "../Components/PaymentManagement";

const Pagos = () => {
  useEffect(() => {
    document.title = "Gestión de Pagos | FreelanceHub";
  }, []);

  return (
    <Layout>
      <PaymentManagement />
    </Layout>
  );
};

export default Pagos;
