import { StyleSheet, Text, View } from 'react-native';
import { AppColors } from '@/constants/app-theme';
/** Inventario: mostrará materiales desde Laravel cuando el endpoint esté listo. */
export default function Inventory(){return <View style={styles.root}><Text style={styles.title}>Inventario</Text><View style={styles.card}><Text style={styles.name}>Mostacilla plateada 4 mm</Text><Text style={styles.detail}>500 g · $25 por gramo</Text></View></View>}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:AppColors.background,padding:28,paddingTop:65},title:{color:'#fff',fontSize:28,fontWeight:'800',marginBottom:24},card:{backgroundColor:AppColors.input,borderColor:AppColors.inputBorder,borderWidth:1,borderRadius:16,padding:18},name:{color:'#fff',fontSize:17,fontWeight:'800'},detail:{color:AppColors.softText,marginTop:5}});
