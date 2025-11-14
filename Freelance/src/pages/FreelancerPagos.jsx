import { useEffect } from "react";
import Layout from "../Components/Layout";
import FreelancerPayments from "../Components/FreelancerPayments";

const FreelancerPagos = () => {
  useEffect(() => {
    document.title = "Mis Pagos | FreelanceHub";
  }, []);

  return (
    <Layout>
      <FreelancerPayments />
    </Layout>
  );
};

export default FreelancerPagos;
