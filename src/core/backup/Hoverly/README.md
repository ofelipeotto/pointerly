#Example:

const customDefault = document.createElement('div');
    customDefault.classList.add('cursor-default');
    customDefault.textContent = '↖️';

    var myCursor = new NuttyCursor({

        //wrapper: '.wrapper-cursor', // Default: document.body

        //systemCursors: true,

        types: {

            'default': {

                onClick: () => {
                    // Opção de adicionar 
                },

                // Render by node
                render: customDefault,
            },

            // Render by function
            'pointer': () => {
                return '<div class="cursor-pointer">👉</div>';
            },

            // Render by function
            'grab': () => {
                return '<div class="cursor-pointer">🤚</div>';
            },

            // Render by string
            'view': '<div class="view">View</div>',
        },

        // Triggers
        /*on: {
            // Basic
            complete: () => {
                console.log('complete');
            },
    
            // Advanced
            complete: {
    
                callback: () => {
                    console.log('Formulário concluído!');
                },
                priority: 500 // Prioridade menor que o padrão (1000)
            },

            move: (e) => {
                console.log(e.elementUnder);
            }
        },*/

        //debug: true,
    });



    var myCursor = new NuttyCursor({

        //wrapper: '.wrapper-cursor', // Default: document.body

        //systemCursors: true,

        types: {
            default: '<div class="cursor-default">👆</div>',
            pointer: '<div class="cursor-default">👆</div>',
            grab:'<div class="cursor-default">🤚</div>',
            text: '<div class="cursor-default">✍️</div>',
            view: '<div class="cursor-default">👀</div>',
        },
    });