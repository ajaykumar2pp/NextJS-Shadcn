import * as yup from "yup";

const addCustomerSchema = yup.object().shape({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),
  firstname: yup.string().required("First name is required"),
  lastname: yup.string().required("Last name is required"),
  company: yup.string().required("Company name is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  country: yup.string().required("Country is required"),
  zip: yup.string().matches(/^\d{6}$/, "Invalid ZIP code").required("Zip is required"),
});

export default addCustomerSchema;
