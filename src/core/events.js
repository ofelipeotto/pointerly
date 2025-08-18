export function addEventTrigger(Pointerly) {

    Pointerly.prototype.on = function (stage, callback, priority = 1000) {

        if (typeof callback === 'function' && this.triggers[stage]) {

            this.triggers[stage].push({ callback, priority });

        } else {

            console.error('Callback deve ser uma função e o estágio deve ser válido (initial, leave, enter).');
        }
    };

    Pointerly.prototype.runTriggers = async function (stage, data = null) {

        if (!this.triggers[stage]) {

            console.error(`Estágio inválido: ${stage}`);
            return;
        }

        // Ordena por prioridade antes de executar
        this.triggers[stage].sort((a, b) => a.priority - b.priority);

        if (this.debug) {
            //console.log(`Funções no estágio "${stage}":`);
            this.triggers[stage].forEach((trigger, index) => {
                //console.log(`Função ${index + 1}:`, trigger.callback.name || "Função anônima");
                //console.log(`Prioridade: ${trigger.priority}`);
                //console.log(`Conteúdo da função: ${trigger.callback.toString()}`);
                //console.log("");
            });
        }

        for (const { callback, priority } of this.triggers[stage]) {
            try {
                await callback(data);
            } catch (error) {
                if (this.debug) {
                    console.error(`Erro ao executar trigger no estágio "${stage}"`);
                    console.error(`Função:`, callback.name || "Função anônima");
                    console.error(`Prioridade: ${priority}`);
                    console.error(`Conteúdo da função: ${callback.toString()}`);
                    console.error(`Erro:`, error);
                    //console.log("");
                }
            }
        }
    };
}