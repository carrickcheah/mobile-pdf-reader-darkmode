import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import LoginScreen from "./components/LoginScreen";
import Library from "./components/Library";
import Reader from "./components/Reader";

type View = { screen: "library" } | { screen: "reader"; bookId: string };

function App() {
  const { isAuthenticated, login, logout } = useAuth();
  const [view, setView] = useState<View>({ screen: "library" });

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  if (view.screen === "reader") {
    return (
      <Reader
        bookId={view.bookId}
        onBack={() => setView({ screen: "library" })}
      />
    );
  }

  return (
    <Library
      onOpen={(id) => setView({ screen: "reader", bookId: id })}
      onLogout={logout}
    />
  );
}

export default App;
