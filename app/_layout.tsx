import { Redirect, Stack } from 'expo-router';

export default function Layout() {
  return (
    <>
      <Redirect href="/login" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}