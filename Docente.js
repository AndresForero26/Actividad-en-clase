import { Persona } from "./Persona.js";

export class Docente extends Persona {
  constructor(nombre, edad, especialidad) {
    super(nombre, edad);
    this.tipo = "docente";
    this.especialidad = especialidad;
  }
}
