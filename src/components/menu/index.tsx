import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Styles } from "./styles";
import { Button } from "@/components/button";

interface MenuProps {
  visible: boolean;
  onClose: () => void;
}

export function Menu({ visible, onClose }: MenuProps) {
  const { user, signOut } = useAuth();

  const navigateTo = (route: string) => {
    onClose();
    router.push(route);
  };

  const handleLogout = async () => {
    onClose();
    await signOut();
    router.replace("/");
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={Styles.overlay}>
        <TouchableOpacity
          style={Styles.clickableOverlay}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={Styles.menuContainer}>
          <View style={Styles.header}>
            <View style={Styles.avatar}>
              <Text style={Styles.avatarText}>
                {user ? user.substring(0, 2).toUpperCase() : "TR"}
              </Text>
            </View>
            <View style={Styles.userInfo}>
              <Text style={Styles.subtitle}>TREINADOR</Text>
              <Text style={Styles.username}>{user || "Admin"}</Text>
            </View>
          </View>
          <View style={Styles.navLinks}>
            <TouchableOpacity
              style={Styles.linkItem}
              onPress={() => navigateTo("/pokedex")}
            >
              <MaterialCommunityIcons
                name="pokeball"
                size={22}
                color="#FF3333"
              />
              <Text style={Styles.linkText}>Pokédex</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={Styles.linkItem}
              onPress={() => navigateTo("/meutime")}
            >
              <MaterialCommunityIcons
                name="sword-cross"
                size={22}
                color="#00FF66"
              />
              <Text style={Styles.linkText}>Meu Time</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={Styles.linkItem}
              onPress={() => navigateTo("/perfil")}
            >
              <MaterialCommunityIcons
                name="account-outline"
                size={22}
                color="#3393FF"
              />
              <Text style={Styles.linkText}>Meu Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={Styles.linkItem}
              onPress={() => navigateTo("/batalha")}
            >
              <MaterialCommunityIcons
                name="sword"
                size={22}
              color="#FF8BE6" 
            />
            <Text style={Styles.linkText}>Arena de Batalha</Text>
          </TouchableOpacity>
          </View>
          <Button
            title="Sair do Aplicativo"
            onPress={handleLogout}
            style={[Styles.logoutButton, { height: 44 }]}
          />
        </View>
      </View>
    </Modal>
  );
}
