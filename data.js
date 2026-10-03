// data.js — Personajes, símbolos, historia, limitación y cómo lo usó Dios
const PAIRS = [
  { name: "David", emoji: "👦", symbol: "👑", symName: "Corona",
    historia: "David cuidaba ovejas en Belén. Venció al gigante Goliat con una honda y cinco piedras, y llegó a ser el rey más amado de Israel.",
    limitacion: "Era el menor de sus hermanos, joven e inexperto. Su padre ni siquiera lo consideró cuando el profeta Samuel fue a ungir a un rey.",
    usoDeDios: "Dios lo usó para vencer a Goliat, unificar Israel y establecer un reinado que duró para siempre: de su linaje nació Jesús.",
    versiculo: "«Jehová es mi pastor; nada me faltará.» — Salmo 23:1" },

  { name: "Noé", emoji: "👳", symbol: "⛵", symName: "Arca",
    historia: "Noé construyó un arca enorme por orden de Dios para salvar a su familia y a los animales del diluvio. Dios puso el arcoíris como señal de su promesa.",
    limitacion: "Nunca había visto llover, no sabía construir barcos, y la gente se burlaba de él mientras construía el arca durante años.",
    usoDeDios: "Dios lo usó para preservar la vida en la tierra y comenzar un nuevo pacto con la humanidad tras el diluvio.",
    versiculo: "«Pero Noé halló gracia ante los ojos de Jehová.» — Génesis 6:8" },

  { name: "Moisés", emoji: "🧔", symbol: "🔥", symName: "Zarza ardiente",
    historia: "Dios se le apareció a Moisés en una zarza que ardía sin consumirse y lo llamó para liberar a Israel de Egipto. Guió al pueblo por el Mar Rojo.",
    limitacion: "Era tartamudo y se sentía incapaz de hablar ante el faraón. Había huido de Egipto como fugitivo 40 años antes.",
    usoDeDios: "Dios lo usó para liberar a su pueblo de la esclavitud, entregar los Diez Mandamientos y guiar a Israel 40 años por el desierto.",
    versiculo: "«Yo estaré contigo.» — Éxodo 3:12" },

  { name: "Abraham", emoji: "👴", symbol: "✨", symName: "Estrellas",
    historia: "Dios prometió a Abraham que tendría tantos descendientes como las estrellas. A los 100 años nació su hijo Isaac. Es el padre de la fe.",
    limitacion: "Era anciano y su esposa Sara era estéril. Humanamente imposible tener hijos; esperaron 25 años la promesa.",
    usoDeDios: "Dios lo usó para iniciar el pueblo de Israel y ser bendición para todas las naciones de la tierra.",
    versiculo: "«Mira ahora a los cielos, y cuenta las estrellas... así será tu descendencia.» — Génesis 15:5" },

  { name: "José", emoji: "🧑", symbol: "🌈", symName: "Túnica de colores",
    historia: "Sus hermanos lo vendieron como esclavo, pero Dios lo llevó a ser gobernador de Egipto. Perdonó a sus hermanos: 'Dios lo encaminó a bien'.",
    limitacion: "Fue vendido como esclavo por sus propios hermanos, acusado falsamente de un crimen y encarcelado siendo inocente.",
    usoDeDios: "Dios lo usó para salvar a Egipto y a su propia familia de una hambruna de 7 años, y para perdonar y reconciliar a su familia.",
    versiculo: "«Vosotros pensasteis mal contra mí, mas Dios lo encaminó a bien.» — Génesis 50:20" },

  { name: "Sansón", emoji: "💪", symbol: "💇", symName: "Cabello",
    historia: "Sansón tenía fuerza sobrenatural dada por Dios. Dalila lo traicionó, pero al final Dios le devolvió la fuerza para cumplir su propósito.",
    limitacion: "Era impulsivo, mujeriego y desobediente. Rompió su voto nazareo varias veces y confió su secreto a Dalila.",
    usoDeDios: "Dios lo usó para comenzar a liberar a Israel de los filisteos, aun a pesar de sus fallas personales.",
    versiculo: "«El Espíritu de Jehová descendió sobre él.» — Jueces 14:6" },

  { name: "Ester", emoji: "👸", symbol: "🏰", symName: "Palacio del rey",
    historia: "Ester era una joven judía que llegó a ser reina de Persia. Con valentía salvó a su pueblo de ser exterminado.",
    limitacion: "Era huérfana, extranjera y mujer en una cultura donde las mujeres no podían presentarse ante el rey sin ser llamadas (bajo pena de muerte).",
    usoDeDios: "Dios la usó para interceder ante el rey y salvar a todo el pueblo judío de un exterminio planeado.",
    versiculo: "«¿Y quién sabe si para esta hora has llegado al reino?» — Ester 4:14" },

  { name: "Daniel", emoji: "🧑‍💼", symbol: "🦁", symName: "Foso de leones",
    historia: "Daniel fue fiel a Dios y oraba tres veces al día. Fue arrojado al foso de los leones, pero Dios envió un ángel que cerró sus bocas.",
    limitacion: "Era un exiliado, joven y extranjero en Babilonia. Estaba lejos de su tierra y su templo, rodeado de idolatría.",
    usoDeDios: "Dios lo usó para interpretar sueños, aconsejar a reyes paganos y mostrar el poder de Dios a toda una nación.",
    versiculo: "«Mi Dios envió su ángel, el cual cerró la boca de los leones.» — Daniel 6:22" },

  { name: "Jonás", emoji: "🙍", symbol: "🐋", symName: "Gran pez",
    historia: "Jonás huyó de Dios, pero un gran pez lo tragó. Después de tres días obedeció y predicó en Nínive, y toda la ciudad se arrepintió.",
    limitacion: "Huyó de Dios por miedo y prejuicio contra los ninivitas. Se enojó cuando Dios mostró misericordia a sus enemigos.",
    usoDeDios: "Dios lo usó para predicar arrepentimiento a Nínive, y toda una ciudad pagana se volvió a Dios.",
    versiculo: "«Levántate y ve a Nínive, y pregona contra ella.» — Jonás 1:2" },

  { name: "Gedeón", emoji: "🧑‍🌾", symbol: "📯", symName: "Trompeta",
    historia: "Gedeón se escondía por miedo, pero Dios lo llamó 'valiente guerrero'. Con solo 300 hombres derrotó al enorme ejército enemigo.",
    limitacion: "Se escondía de los madianitas por miedo. Pidió señales a Dios tres veces porque no creía ser capaz.",
    usoDeDios: "Dios lo usó para liberar a Israel con solo 300 hombres, mostrando que la victoria es de Dios, no de la fuerza humana.",
    versiculo: "«Jehová está contigo, valiente guerrero.» — Jueces 6:12" },

  { name: "Rut", emoji: "👩", symbol: "🌾", symName: "Espigas de trigo",
    historia: "Rut, viuda moabita, se quedó junto a su suegra Noemí. Su fidelidad la llevó a casarse con Booz y ser bisabuela del rey David.",
    limitacion: "Era viuda, extranjera (moabita) y pobre. Recogía espigas en los campos para comer, un trabajo humilde y peligroso.",
    usoDeDios: "Dios la usó para formar parte de la genealogía del rey David y, por ende, del propio Jesús.",
    versiculo: "«Tu pueblo será mi pueblo, y tu Dios mi Dios.» — Rut 1:16" },

  { name: "Salomón", emoji: "🤴", symbol: "🏛️", symName: "Templo",
    historia: "Salomón pidió sabiduría a Dios y recibió también riquezas y gloria. Construyó el primer Templo de Jerusalén.",
    limitacion: "Era joven e inexperto al subir al trono. Se sentía como 'un niño pequeño' que no sabía gobernar.",
    usoDeDios: "Dios lo usó para construir el Templo, escribir Proverbios y guiar a Israel en su época de mayor esplendor.",
    versiculo: "«Da, pues, a tu siervo un corazón entendido para juzgar a tu pueblo.» — 1 Reyes 3:9" },

  { name: "Juan el Bautista", emoji: "🧑‍🦱", symbol: "🌊", symName: "Río Jordán",
    historia: "Juan predicaba en el desierto y bautizaba en el río Jordán. Tuvo el honor de bautizar a Jesús y señalarlo como 'el Cordero de Dios'.",
    limitacion: "Vivía en el desierto, vestía con pelo de camello y comía langostas. No hacía milagros y muchos lo rechazaban por su estilo de vida.",
    usoDeDios: "Dios lo usó para preparar el camino al Mesías y bautizar a Jesús, señalándolo como el Salvador del mundo.",
    versiculo: "«He aquí el Cordero de Dios, que quita el pecado del mundo.» — Juan 1:29" },

  { name: "Pablo", emoji: "🧑‍🏫", symbol: "💡", symName: "Luz del camino",
    historia: "Pablo perseguía a los cristianos hasta que Jesús lo detuvo camino a Damasco. Se convirtió en el mayor misionero y escribió 13 cartas del Nuevo Testamento.",
    limitacion: "Antes de convertirse perseguía y mataba cristianos. Además tenía un 'aguijón en la carne' que nunca le fue quitado.",
    usoDeDios: "Dios lo usó para llevar el evangelio a todo el mundo romano, fundar iglesias y escribir gran parte del Nuevo Testamento.",
    versiculo: "«Me es necesario también anunciar a otros el reino de Dios.» — Lucas 4:43" }
];

module.exports = { PAIRS };