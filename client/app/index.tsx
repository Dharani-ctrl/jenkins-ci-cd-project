import { Redirect } from "expo-router";

export default function Index() {
  // Redirect users directly to login screen on app load
  return <Redirect href="/Login" />;
}
