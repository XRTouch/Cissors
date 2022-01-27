class Ciseaux {
    /** Socket de connection entre les ciseaux et le serveur */
    static socket = null;
    /**@type {number} Angle des ciseaux */
    static angle = 0;

    /**
     * Initialise les ciseaux
     */
    constructor() {
        if (Cisaeux.socket == null) {
            Ciseaux.socket = io();
            Ciseaux.socket.on("custom/getAngle", val => {
                Ciseaux.angle = Math.max(Math.min(val-44, 180), 0);
            });
        }
    }

    /**
     * Change l'angle des ciseaux (en degres, entre 0 et 70)
     * @param {number} angle nouvel angle des ciseaux (0-70)
     */
    setAngle(angle) {
        socket.emit("custom/setAngle", angle);
    }

    /**
     * Retourne l'angle des ciseaux
     * @returns angle des ciseaux en degres
     */
    getAngle() {
        return Ciseaux.angle;
    }
}