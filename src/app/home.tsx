import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppColors } from '@/constants/app-theme';

/** Menú principal: centraliza los módulos funcionales del emprendimiento. */
export default function Home() {
  // Paso 1: abre la ruta del módulo seleccionado.
  const openInventory = () => router.push('/inventory');
  return <View style={styles.root}><Text style={styles.title}>Hola, Ana.</Text><Text style={styles.subtitle}>¿Qué deseas gestionar hoy?</Text><Pressable style={styles.card} onPress={openInventory}><Text style={styles.cardTitle}>Inventario</Text><Text style={styles.cardText}>Materiales y existencias</Text><Text style={styles.status}>Disponible</Text></Pressable><View style={styles.card}><Text style={styles.cardTitle}>Diseños</Text><Text style={styles.cardText}>Próximamente</Text></View><View style={styles.card}><Text style={styles.cardTitle}>Calculadora</Text><Text style={styles.cardText}>Próximamente</Text></View></View>;
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:AppColors.background,padding:28,paddingTop:65},title:{color:'#fff',fontSize:28,fontWeight:'800'},subtitle:{color:AppColors.softText,marginTop:6,marginBottom:26},card:{backgroundColor:AppColors.input,borderColor:AppColors.inputBorder,borderWidth:1,borderRadius:16,padding:18,marginBottom:12},cardTitle:{color:'#fff',fontSize:18,fontWeight:'800'},cardText:{color:AppColors.softText,marginTop:5},status:{color:AppColors.turquoise,fontWeight:'800',marginTop:12,fontSize:12}});
