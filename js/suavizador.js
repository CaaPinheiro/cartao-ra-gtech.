// Suaviza a posição do cartão detectada pela câmera para o conteúdo 3D não "tremer".
// Movimentos pequenos (ruído) são filtrados; movimentos grandes são seguidos mais rápido.
import * as THREE from 'three';

export class Suavizador {
  /**
   * @param {THREE.Object3D} alvo  objeto que vai receber a pose suavizada
   * @param {number} tauMs        constante de tempo (ms). 0 = sem suavização
   */
  constructor(alvo, tauMs = 110) {
    this.alvo = alvo;
    this.tau = tauMs;
    this.p = new THREE.Vector3();
    this.q = new THREE.Quaternion();
    this.s = new THREE.Vector3(1, 1, 1);
    this._p = new THREE.Vector3();
    this._q = new THREE.Quaternion();
    this._s = new THREE.Vector3();
    this.iniciado = false;
  }

  reiniciar() {
    this.iniciado = false;
  }

  /** @param {THREE.Matrix4} matriz pose atual do cartão  @param {number} dtMs tempo desde o último quadro */
  atualizar(matriz, dtMs) {
    matriz.decompose(this._p, this._q, this._s);
    if (!this.iniciado || this.tau <= 0) {
      this.p.copy(this._p);
      this.q.copy(this._q);
      this.s.copy(this._s);
      this.iniciado = true;
    } else {
      const distancia = this._p.length() || 1;
      const erroPosicao = this.p.distanceTo(this._p) / distancia; // erro relativo à distância
      const erroAngulo = this.q.angleTo(this._q);                  // em radianos
      const k = Math.min(1, Math.max(erroPosicao / 0.06, erroAngulo / 0.2));
      const tau = this.tau * (1 - 0.75 * k);
      const a = 1 - Math.exp(-Math.min(dtMs, 100) / tau);
      this.p.lerp(this._p, a);
      this.q.slerp(this._q, a);
      this.s.lerp(this._s, a);
    }
    this.alvo.position.copy(this.p);
    this.alvo.quaternion.copy(this.q);
    this.alvo.scale.copy(this.s);
  }
}
