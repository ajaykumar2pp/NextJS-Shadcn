import * as yup from "yup";

const registerSchema = yup.object().shape({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  firstname: yup.string().required("First name is required"),
  lastname: yup.string().required("Last name is required"),
  company: yup.string().required("Company name is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  country: yup.string().required("Country is required"),
  zip: yup.string().matches(/^\d{6}$/, "Invalid ZIP code").required("Zip is required"),
  phone: yup.string().required("Phone number is required"),
  about: yup.string().required("About is required"),
});

export default registerSchema;
