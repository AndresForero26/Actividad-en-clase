import { Persona } from "./Persona.js";

export class Estudiante extends Persona {
  constructor(nombre, edad, curso) {
    super(nombre, edad);
    this.tipo = "estudiante";
    this.curso = curso;
  }
}
