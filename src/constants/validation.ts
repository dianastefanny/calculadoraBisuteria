// Reglas de validación de formularios, centralizadas para no repetirlas en
// cada pantalla que pida nombre/apellido/teléfono/correo/contraseña
// (Registro, Configuraciones, y las que se agreguen más adelante).

// Nombre y apellido: solo letras, espacios, tildes y ñ.
export const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]+$/;

// Teléfono: dígitos, espacios, +, - y paréntesis, entre 7 y 15 caracteres.
export const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;

// Correo: algo@algo.algo.
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Contraseña: mínimo 8 caracteres, con al menos una mayúscula, una
// minúscula, un número y un carácter especial.
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;
