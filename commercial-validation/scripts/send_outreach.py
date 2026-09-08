#!/usr/bin/env python3
"""
Script de Automatización de Outreach Institucional - MIRATEA by Solutech
Remitente: Xavi Alonso <xavi@miratea.es>
"""

import os
import sys
import time
import json
import smtplib
import imaplib
import email
from email.header import decode_header
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# Asegurar UTF-8 en Windows terminal
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Rutas del proyecto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_FILE = os.path.join(BASE_DIR, ".env.local")
LOG_JSON_FILE = os.path.join(BASE_DIR, "commercial-validation", "outreach_log.json")
DOC_MD_FILE = os.path.join(BASE_DIR, "commercial-validation", "OUTREACH_ASOCIACIONES_MURCIA.md")

def load_env():
    env = {}
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    env[key.strip()] = val.strip()
    return env

CONTACTOS = [
    # PRIORIDAD 1
    {
        "id": 1,
        "nombre": "Lorca Activa TDAH",
        "categoria": "TDAH",
        "ubicacion": "Lorca",
        "email": "asociacion@lorcaactivatdah.es",
        "prioridad": 1,
        "asunto": "MIRATEA: apoyo a la autonomía y autorregulación para familias con TDAH en Lorca",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una aplicación pensada para acompañar a familias con niños en el espectro autista, TDAH o altas capacidades en el día a día: rutinas visuales, gestión emocional y organización de metas, todo sin rachas, sin comparaciones ni presión.

Os escribo directamente desde Lorca, mi ciudad, donde sigo muy de cerca el trabajo tan necesario y valioso que hacéis desde Lorca Activa apoyando a familias y niños con TDAH en nuestra localidad. Me encantaría compartir con vosotros lo que hemos construido, por si os parece una herramienta útil para vuestras familias.

Un poco de contexto: MIRATEA nació de una necesidad real y personal en casa, no de una idea de laboratorio. La hemos usado y validado en el día a día familiar antes de plantearnos llevarla más allá. Algunos pilares clave pensados para perfiles TDAH y neurodivergentes:

- Cero mecánicas punitivas: no hay rachas que se rompan por despistes, ni comparación con otros niños, ni mensajes de "has fallado".
- Descomposición de metas grandes en micropasos pequeños y alcanzables, con ayuda de IA y protección estricta de datos de los menores.
- Rutinas visuales claras y flexibles que reducen la fricción matutina y vespertina sin agobiar con cronómetros estresantes.
- Un compañero digital (Lumi) que acompaña con calma y nunca retrocede de nivel ni culpabiliza.
- Informes objetivos que los padres pueden compartir con terapeutas y orientadores si lo desean.

No pretendemos sustituir el acompañamiento profesional que ofrecéis — todo lo contrario, la concebimos como un puente complementario para el día a día en casa que refuerza la autonomía y la calma familiar. Podéis ver más detalles de la plataforma en https://miratea.es.

Al estar aquí mismo en Lorca, me encantaría acercarme a vuestra sede para enseñárosla con calma o compartir una breve charla de 15 minutos cuando os venga bien. ¿Cómo tenéis la agenda en las próximas semanas?

Quedo a vuestra entera disposición.

Un saludo cordial,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },
    {
        "id": 2,
        "nombre": "Talentismo (Astrade) — Delegación Lorca",
        "categoria": "TEA",
        "ubicacion": "Lorca",
        "email": "atlorca@astrade.es",
        "prioridad": 1,
        "asunto": "MIRATEA y el apoyo a familias en el espectro autista en Lorca",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una aplicación pensada para acompañar a familias con niños en el espectro autista, TDAH o altas capacidades en el día a día: rutinas visuales, gestión emocional y organización de metas, todo sin rachas, sin comparaciones ni presión.

Os escribo desde Lorca, donde resido y trabajo, conociendo de primera mano la gran labor de atención temprana y apoyo continuado que vuestra delegación realiza con las personas con TEA y sus familias en nuestra comarca. Me encantaría compartir con vuestro equipo lo que hemos desarrollado.

Un poco de contexto: MIRATEA nació de una vivencia familiar real, no de un despacho. La hemos probado y madurado en el día a día antes de abrirla a más familias. Algunos aspectos pensados específicamente para el perfil TEA:

- Un Rincón de Calma con respiración visual guiada, frecuencias armónicas y estimulación sensorial cuidada y respetuosa.
- Un entorno visual predecible y limpio, diseñado para evitar sobrecarga o saturación sensorial.
- Un compañero digital (Lumi) que nunca retrocede, no penaliza y ofrece un refuerzo afectivo seguro y constante.
- Cero mecánicas punitivas: eliminamos la presión de rachas, comparativas o lenguaje frustrante.
- Informes de evolución que las familias pueden compartir de forma transparente con sus terapeutas.

No pretendemos en ningún caso sustituir la labor terapéutica — la vemos como una herramienta de soporte para casa que aporta consistencia y facilita el seguimiento entre familia y profesionales. Podéis ver el proyecto en https://miratea.es.

Estando aquí en Lorca, sería un placer acercarme a vuestras instalaciones para una breve demo sin ningún compromiso, o conectar por videollamada si os resulta más cómodo. ¿Tendríais un hueco en los próximos días?

Quedo a vuestra disposición.

Un saludo cordial,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },
    {
        "id": 3,
        "nombre": "ASTEAMUR (Centro Puerto Lumbreras y Sede Central Murcia)",
        "categoria": "TEA",
        "ubicacion": "Puerto Lumbreras / Murcia",
        "email": "info@asteamur.org",
        "prioridad": 1,
        "asunto": "Una herramienta para familias TEA en la Región: saludo desde Lorca a ASTEAMUR",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una aplicación concebida para acompañar a familias con niños en el espectro autista, TDAH o altas capacidades en su día a día: rutinas visuales, autorregulación emocional y organización de metas, todo sin dinámicas punitivas.

Os escribo desde Lorca, como vecino muy cercano a vuestro centro de Puerto Lumbreras y admirador de la referencia indispensable que representáis desde vuestra sede central en Murcia para toda la comunidad TEA de nuestra Región. Me encantaría poder presentaros MIRATEA por si consideráis que puede ser un recurso valioso para las familias a las que acompañáis en ambas sedes.

Un poco de contexto: MIRATEA nació de una necesidad personal y familiar concreta. La hemos vivido, probado y validado en casa antes de dar el paso de ofrecerla. Algunos rasgos que la definen especialmente para niños en el espectro autista:

- Un Rincón de Calma con ejercicios de respiración guiada y estimulación acústica armónica, pensado para momentos de desregulación o fatiga sensorial.
- Cero sobreestimulación: interfaz tranquila, predecible y sin estridencias.
- Un compañero digital (Lumi) que nunca pierde nivel, no emite juicios ni culpabiliza al menor.
- Descomposición de metas en pequeños hitos visuales, con estricta privacidad de los datos de los menores.
- Informes exportables para facilitar la comunicación fluida entre la familia y vuestros profesionales de intervención.

Entendemos MIRATEA no como un sustituto de la terapia especializada, sino como un aliado cotidiano en el hogar que refuerza las rutinas y la calma que tanto se trabajan en sesión. Podéis consultar más sobre la herramienta en https://miratea.es.

Estaría encantado de enseñaros la app con calma, ya sea acercándome a Puerto Lumbreras, a Murcia o a través de una breve videollamada de 15 minutos, según lo que os resulte más práctico. ¿Os vendría bien explorar una fecha para las próximas semanas?

Muchísimas gracias por vuestra labor y dedicación diaria.

Un saludo cordial,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },
    {
        "id": 11,
        "nombre": "Teayuda (TEA Noroeste)",
        "categoria": "TEA",
        "ubicacion": "Caravaca de la Cruz",
        "email": "teayudanoroeste@gmail.com",
        "prioridad": 1,
        "asunto": "MIRATEA: autorregulación y rutinas para familias con TEA en el Noroeste",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una aplicación creada para apoyar a familias con niños en el espectro autista, TDAH o altas capacidades: rutinas estructuradas, gestión emocional y metas alcanzables sin presión ni castigos.

Os escribo desde Lorca, relativamente cerca de vuestra comarca del Noroeste, siguiendo con mucho respeto el esfuerzo y compromiso que ponéis desde Teayuda para acercar atención y recursos especializados a las familias de Caravaca y los municipios vecinos. Me gustaría compartir con vosotros este proyecto por si resulta de interés para vuestra comunidad.

Un poco de contexto: MIRATEA nació de una vivencia real en el entorno familiar. La hemos contrastado y usado en nuestro propio día a día antes de abrirla a más personas. Algunos puntos clave:

- Un Rincón de Calma para ayudar en momentos de sobrecarga, con respiración pautada y frecuencias armónicas.
- Estructura visual predecible, sin sobreestimulación sensorial ni tiempos límite estresantes.
- Lumi, un compañero que acompaña siempre desde el refuerzo afectivo y jamás penaliza ni retrocede de nivel.
- Cero mecánicas punitivas: no existen rachas que se rompan ni sensación de fracaso.
- Registro de evolución pensado para ser compartido con terapeutas si la familia lo desea.

Nuestra visión es complementar la gran labor terapéutica que hacéis, aportando a los padres una herramienta serena para los momentos cotidianos en casa. Podéis conocer la iniciativa en https://miratea.es.

Dada la cercanía comarcal, me encantaría poder enseñárosla en persona o mediante una breve llamada sin ningún compromiso para escuchar vuestro punto de vista profesional. ¿Cómo tenéis la disponibilidad en las próximas semanas?

Muchas gracias por vuestra entrega con las familias del Noroeste.

Un saludo cordial,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },

    # PRIORIDAD 2
    {
        "id": 4,
        "nombre": "FAUM (Federación Autismo Región de Murcia)",
        "categoria": "TEA - Federación",
        "ubicacion": "Murcia",
        "email": "info@autismomurcia.org",
        "prioridad": 2,
        "asunto": "Presentación de MIRATEA a FAUM: tecnología de autorregulación para familias con TEA en la Región",
        "cuerpo": """Estimado equipo de FAUM,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una aplicación murciana desarrollada para acompañar a familias con niños en el espectro autista, TDAH y neurodivergencia en el hogar: rutinas visuales, autorregulación y gestión de metas sin componentes punitivos ni sobrecarga sensorial.

Como entidad federativa referente que agrupa y representa al movimiento asociativo del autismo en la Región de Murcia, me pongo en contacto con vosotros para presentaros la herramienta y explorar si consideráis de interés su conocimiento y eventual difusión entre vuestras entidades federadas.

MIRATEA nace de una experiencia personal y familiar directa. La hemos diseñado bajo premisas de máximo rigor ético y respeto a los ritmos de cada menor:

- Entorno sensorialmente seguro: sin saturación gráfica ni estímulos invasivos.
- Rincón de Calma: herramientas interactivas de respiración pautada y sonido armónico para situaciones de desregulación.
- Acompañamiento positivo sin punición: el compañero digital (Lumi) nunca retrocede ni penaliza; eliminamos las dinámicas de rachas destructivas.
- Respeto absoluto a la privacidad: cumplimiento estricto de protección de datos de menores y posibilidad de exportar resúmenes para el equipo terapéutico.

La aplicación está concebida exclusivamente como un soporte complementario en el ámbito doméstico que refuerza el bienestar familiar y ayuda a consolidar las pautas trabajadas con los profesionales. Podéis encontrar más información en https://miratea.es.

Estaría muy agradecido si pudiéramos mantener una breve reunión o videollamada para presentaros la plataforma de primera mano. Asimismo, nos encantaría conocer si, tras valorarla, veríais viable compartir la iniciativa con las asociaciones que integran la Federación.

Agradeciendo de antemano vuestra atención y vuestra imprescindible labor de vertebración regional, quedo a vuestra disposición.

Atentamente,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },
    {
        "id": 5,
        "nombre": "Talentismo (Astrade) — Sede General",
        "categoria": "TEA",
        "ubicacion": "Molina de Segura",
        "email": "hola@talentismo.org",
        "prioridad": 2,
        "asunto": "MIRATEA: nueva iniciativa murciana de autorregulación y rutinas para familias con TEA",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una aplicación enfocada en facilitar la autorregulación emocional, las rutinas visuales y la autonomía de niños neurodivergentes sin presiones ni penalizaciones.

Conociendo vuestra trayectoria de casi tres décadas como referente indispensable en la atención al autismo en nuestra Región (desde los inicios de Astrade hasta la actual Talentismo), os escribo para compartir un proyecto nacido también aquí en Murcia, por si resultara de utilidad para las familias que atendéis.

MIRATEA surge de una necesidad real en el seno familiar, probada en casa antes de plantear su apertura. Algunos de sus elementos diferenciales:

- Rincón de Calma con dinámicas de respiración y frecuencias auditivas diseñadas para acompañar la vuelta a la calma sin sobreestimulación.
- Rutinas estructuradas y secuenciadas de forma clara y predecible.
- Lumi, un compañero afectivo que nunca juzga, nunca pierde nivel y refuerza siempre los avances logrados.
- Ausencia de rachas punitivas: ningún menor siente que "ha fallado" por tener un mal día.
- Espacio para compartir registros de evolución con el equipo terapéutico.

Nuestro propósito es ofrecer a las familias una aliada doméstica respetuosa que sume al trabajo profesional que desarrolláis a diario. Tenéis más detalles en https://miratea.es.

Me encantaría tener la oportunidad de mostraros una demo rápida de 15 minutos en persona o por videollamada, y recoger vuestras impresiones. ¿Os vendría bien agendar un hueco próximamente?

Un saludo cordial,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },
    {
        "id": 7,
        "nombre": "ABAMUR",
        "categoria": "TEA",
        "ubicacion": "Murcia",
        "email": "abamur@abamur.org",
        "prioridad": 2,
        "asunto": "MIRATEA: estructuración visual y refuerzo positivo para el día a día en casa",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una plataforma orientada a apoyar a familias con niños neurodivergentes mediante rutinas visuales, autorregulación y secuenciación de objetivos cotidianos.

Conozco el trabajo riguroso, estructurado y basado en el análisis de conducta aplicado (ABA) que desarrolláis en ABAMUR con menores con TEA en Murcia. Por ello, me gustaría presentaros la herramienta, orientada a aportar consistencia a las rutinas en el hogar.

MIRATEA parte de una experiencia familiar propia y prioriza la claridad conductual y el refuerzo positivo natural:

- Descomposición de objetivos cotidianos en pasos concretos y medibles, adaptados al ritmo del niño.
- Rutinas visuales consistentes que reducen la incertidumbre y facilitan la transición entre actividades.
- Refuerzo motivacional sin contingencias aversivas ni rachas destructivas: el progreso alcanzado se preserva siempre.
- Rincón de Calma adaptado para reducir estados de alta activación motora o emocional.
- Trazabilidad y reportes que la familia puede poner a disposición de los terapeutas.

No busca sustituir ninguna pauta clínica, sino servir como un entorno digital estructurado que facilite la generalización de habilidades en el entorno familiar. Podéis conocer la plataforma en https://miratea.es.

Sería un placer coordinar una breve llamada o visita para enseñárosla y conocer vuestra opinión técnica. ¿Tendríais disponibilidad para una breve conversación en las próximas semanas?

Un cordial saludo,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },
    {
        "id": 8,
        "nombre": "Aspermur (Asociación Asperger Murcia)",
        "categoria": "TEA",
        "ubicacion": "Puente Tocinos, Murcia",
        "email": "info@aspermur.org",
        "prioridad": 2,
        "asunto": "MIRATEA: organización de rutinas y calma emocional para familias de Aspermur",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una aplicación concebida para apoyar a familias con niños y jóvenes en el espectro autista, TDAH o altas capacidades en su autonomía y bienestar emocional.

Sigo de cerca la labor de acompañamiento, defensa y asesoramiento que realizáis desde Aspermur con personas con síndrome de Asperger y autismo nivel 1 en la Región. Os escribo porque creo que el enfoque de MIRATEA puede encajar muy bien con las necesidades de vuestras familias socias.

El proyecto nació para responder a situaciones reales de convivencia y retos cotidianos. Algunas características clave:

- Organización de tareas y retos divididos en micropasos lógicos, facilitando la planificación sin saturar la función ejecutiva.
- Rincón de Calma con pautas de respiración y descanso sensorial, útil para momentos de sobrecarga cognitiva o social.
- Filosofía no punitiva: eliminamos la frustración asociada a pérdidas de rachas o sistemas de evaluación rígidos.
- Un compañero digital (Lumi) que actúa como anclaje positivo y constante.
- Posibilidad de compartir registros con orientadores o terapeutas.

Nuestra intención es sumar una herramienta práctica para casa que ayude a gestionar la rutina con menos estrés y mayor predictibilidad. Podéis ver más en https://miratea.es.

¿Os encajaría concertar una breve videollamada o encuentro para enseñaros la app y escuchar vuestro criterio? Quedo a vuestra disposición para cuando os resulte oportuno.

Un saludo muy cordial,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },
    {
        "id": 9,
        "nombre": "Autismo Somos Todos",
        "categoria": "TEA",
        "ubicacion": "Cartagena",
        "email": "info@autismosomostodos.org",
        "prioridad": 2,
        "asunto": "MIRATEA: herramienta de autorregulación y rutinas para familias en Cartagena",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una aplicación creada para apoyar a familias con niños en el espectro autista y perfiles afines en sus rutinas diarias y bienestar emocional.

Os contacto porque conozco el compromiso y la cercanía con la que trabajáis desde Autismo Somos Todos para mejorar la calidad de vida de las personas con TEA y sus familias en Cartagena y comarca. Me encantaría compartir con vosotros nuestra propuesta.

MIRATEA es el resultado de un desarrollo familiar y personal contrastado en el hogar. Destaca por:

- Un entorno libre de sobreestimulación, diseñado con serenidad visual y máxima previsibilidad.
- Rincón de Calma interactivo para facilitar la autorregulación ante desbordamientos sensoriales o emocionales.
- Acompañamiento positivo sin juicio: Lumi nunca castiga ni retrocede de nivel.
- Cero mecánicas de presión o rachas frágiles, reforzando la seguridad y la autoestima del menor.
- Informes claros que los padres pueden facilitar a su equipo de apoyo terapéutico.

Creemos firmemente en el trabajo conjunto con las entidades especializadas para que las familias tengan mejores apoyos en el día a día doméstico. Podéis explorar la web en https://miratea.es.

¿Os apetecería mantener una breve charla o videollamada en las próximas semanas para que podáis conocer la aplicación sin ningún tipo de compromiso?

Muchas gracias por vuestra gran dedicación diaria.

Un saludo cordial,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },
    {
        "id": 10,
        "nombre": "Ingloba TEA",
        "categoria": "TEA",
        "ubicacion": "Región de Murcia",
        "email": "info@inglobatea.es",
        "prioridad": 2,
        "asunto": "MIRATEA: tecnología accesible para el bienestar y la autonomía en TEA",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una solución pensada para acompañar a niños en el espectro autista y sus familias en la gestión cotidiana de rutinas y estados emocionales.

Valoro mucho vuestra labor en favor de la inclusión activa, la sensibilización y el desarrollo integral de las personas con TEA en la Región de Murcia. Por ello, me gustaría acercaros los avances de MIRATEA y evaluar posibles sinergias.

La herramienta surge de la experiencia directa en el hogar y se sostiene sobre principios de diseño inclusivo:

- Rincón de Calma con estimulación armónica y ejercicios respiratorios para prevenir y gestionar la sobrecarga sensorial.
- Secuenciación visual de tareas sin límite de tiempo estresante, favoreciendo la autonomía paso a paso.
- Dinámica sin castigos ni pérdidas de nivel: cuidamos que la experiencia sea siempre gratificante y segura.
- Lumi, una presencia amigable que refuerza el esfuerzo individual sin comparativas sociales.
- Facilidad para transferir observaciones y datos de uso a los profesionales de referencia.

Nos encantaría contar con vuestra mirada experta y valorar si puede ser de utilidad para las familias a las que orientáis. Tenéis más información en https://miratea.es. ¿Podríamos coordinar una breve llamada de presentación en los próximos días?

Quedo a vuestra total disposición.

Un saludo cordial,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },
    {
        "id": 15,
        "nombre": "ADAHI Murcia",
        "categoria": "TDAH",
        "ubicacion": "Espinardo / Cartagena",
        "email": "adahimurcia.gestion@hotmail.com",
        "prioridad": 2,
        "asunto": "MIRATEA: rutinas visuales y metas paso a paso para niños con TDAH en la Región",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una aplicación enfocada en el apoyo a familias con niños con TDAH y perfiles neurodivergentes: rutinas predecibles, secuenciación visual de actividades y regulación emocional sin estrés.

Os escribo reconociendo la trayectoria consolidada y el soporte esencial que ADAHI Murcia ofrece a cientos de familias que conviven con el TDAH en diversos puntos de la Región (Espinardo, Cartagena y comarcas). Sería un honor poder compartir con vuestro equipo lo que hemos construido.

Nuestra experiencia propia en casa nos enseñó que las aplicaciones tradicionales a menudo aumentan la frustración del niño con TDAH por el exceso de notificaciones, cronómetros agresivos o rachas punitivas. En MIRATEA hemos cambiado completamente ese paradigma:

- Descomposición guiada de metas complejas en micropasos muy sencillos, reduciendo el bloqueo por procrastinación o dispersión.
- Rutinas visuales claras sin penalización de tiempo, respetando los diferentes ritmos atencionales.
- Cero rachas que se borran si un día se complica: el esfuerzo acumulado nunca desaparece.
- Lumi, un compañero digital que refuerza positivamente y nunca culpabiliza.
- Informes de hábitos accesibles para los padres y coordinables con terapeutas u orientadores escolares.

La herramienta no pretende suplir la intervención psicopedagógica, sino ser un facilitador en casa para reducir las discusiones diarias y fomentar la autoeficacia. Podéis consultar más sobre el proyecto en https://miratea.es.

¿Os vendría bien mantener una breve llamada o videollamada para conocerla de primera mano? Estaré encantado de adaptarme a vuestra disponibilidad.

Un saludo muy cordial,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },
    {
        "id": 16,
        "nombre": "Águilas Vida Activa",
        "categoria": "TDAH",
        "ubicacion": "Águilas",
        "email": "aguilasvidaactiva@hotmail.com",
        "prioridad": 2,
        "asunto": "MIRATEA: apoyo al día a día de familias con TDAH desde la comarca vecina",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una aplicación diseñada para facilitar rutinas amables, autonomía y gestión emocional en familias con niños con TDAH y neurodivergencia.

Desde la vecina Lorca os escribo siguiendo la cercanía y dedicación con la que desde Águilas Vida Activa apoyáis a familias, niños y jóvenes con TDAH en la costa de nuestra comarca. Me gustaría acercaros el proyecto por si consideráis interesante que vuestras familias lo conozcan.

MIRATEA nació precisamente de las vivencias reales del día a día en casa:

- Organización de tareas y deberes en pequeños pasos asumibles, evitando que el niño se sienta desbordado antes de empezar.
- Rutinas visuales flexibles y tranquilas, pensadas para momentos críticos como las mañanas o el inicio del estudio.
- Ausencia total de mecánicas punitivas: no hay contadores de días que se reinicien a cero ni reproches.
- Rincón de Calma para pausar y regularse cuando surge la impulsividad o el cansancio.
- Seguimiento accesible para los padres que puede orientar las revisiones con especialistas.

Dada la cercanía entre Lorca y Águilas, me encantaría mantener un breve encuentro o una llamada de 15 minutos para enseñárosla de forma distendida. Podéis ver la web en https://miratea.es. ¿Cómo tenéis la agenda en las próximas semanas?

Un afectuoso saludo,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },
    {
        "id": 18,
        "nombre": "Talentos — Altas Capacidades Región de Murcia",
        "categoria": "Altas Capacidades",
        "ubicacion": "Murcia",
        "email": "talentos@altascapacidadesmurcia.org",
        "prioridad": 2,
        "asunto": "MIRATEA: organización de metas complejas y gestión emocional para niños con Altas Capacidades",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una aplicación concebida para acompañar a niños con perfiles de altas capacidades y neurodivergencia en la organización de metas complejas, la autonomía y la autorregulación emocional.

Conozco la destacada labor de divulgación, acompañamiento y defensa de la diversidad que realizáis desde Talentos con las familias de niños con altas capacidades y doble excepcionalidad en toda la Región de Murcia. Me gustaría mostraros lo que hemos desarrollado pensando en las particularidades de estos perfiles.

Un reto habitual que vemos en el día a día con altas capacidades es la gestión del perfeccionismo, la frustración ante el error y la dispersión cuando un proyecto requiere desglosarse en pasos metódicos. MIRATEA aborda esto específicamente:

- Descomposición de grandes proyectos o inquietudes en hitos sucesivos claros mediante asistencia estructurada, evitando bloqueos por exigencia desmedida.
- Cero comparación externa ni rankings competitivos: el foco reside en el crecimiento propio.
- Cero mecánicas punitivas: si un día se interrumpe la rutina, el nivel y los logros se conservan intactos, mitigando la sensación de fracaso.
- Rincón de Calma con respiración visual y sonidos armónicos, muy útil ante la intensidad emocional o sensorial frecuente en estos niños.
- Lumi, un compañero digital empático que acompaña el proceso sin infantilizar la experiencia.

No buscamos reemplazar el asesoramiento especializado que proporcionáis, sino dotar a las familias de un instrumento práctico y respetuoso en casa. Podéis conocer la iniciativa en https://miratea.es.

Me encantaría mantener una breve conversación o videollamada para enseñaros la aplicación y recoger vuestras valiosas impresiones. ¿Tendríais un espacio en vuestra agenda en los próximos días?

Agradeciendo mucho vuestro trabajo, os envío un saludo cordial.

Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },

    # PRIORIDAD 3
    {
        "id": 12,
        "nombre": "TEA Yecla",
        "categoria": "TEA",
        "ubicacion": "Yecla",
        "email": "teayecla@hotmail.es",
        "prioridad": 3,
        "asunto": "MIRATEA: una propuesta de apoyo para familias con TEA en Yecla",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una aplicación pensada para facilitar el día a día de familias con niños en el espectro autista y neurodivergencia mediante rutinas visuales, calma sensorial y autonomía.

Os escribo desde la admiración a la labor cercana y tenaz que lleváis a cabo con las familias con TEA en la comarca del Altiplano. Me gustaría presentaros MIRATEA por si consideráis que puede aportar a los hogares de vuestros asociados.

La aplicación surge de una vivencia familiar personal y prioriza el confort y la ausencia de estrés:

- Rincón de Calma con dinámicas de respiración y sonidos armónicos para favorecer la regulación sensorial.
- Rutinas visuales sencillas y secuenciadas que aportan seguridad y predictibilidad en el hogar.
- Filosofía no punitiva: no hay rachas que penalicen los días complicados.
- Lumi, un compañero que ofrece soporte afectivo constante y nunca retrocede de nivel.
- Informes opcionales para facilitar el diálogo entre familias y profesionales.

Sería estupendo poder mostraros una demo de 10-15 minutos por videollamada en el momento que mejor os encaje. Podéis ver más sobre el proyecto en https://miratea.es. ¿Tendríais un hueco las próximas semanas?

Muchas gracias por vuestro esfuerzo diario en Yecla.

Un saludo cordial,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },
    {
        "id": 13,
        "nombre": "Fundación Estrella Azul",
        "categoria": "TEA",
        "ubicacion": "Alcantarilla",
        "email": "info@fundacionestrellaazul.org",
        "prioridad": 3,
        "asunto": "MIRATEA: apoyo a la autorregulación y rutinas para familias con TEA",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una aplicación enfocada en el bienestar y la autonomía cotidiana de niños en el espectro autista y sus familias.

Me pongo en contacto con vosotros valorando la labor asistencial y formativa que desarrolláis desde la Fundación Estrella Azul en Alcantarilla en favor de las personas con autismo. Desearía compartir con vosotros nuestra herramienta por si resulta de interés para vuestra comunidad de familias.

MIRATEA ha sido diseñada desde la práctica en el entorno familiar directo, destacando por:

- Rincón de Calma: apoyo visual y acústico armónico orientado a facilitar la vuelta a la calma tras picos de saturación sensorial.
- Estructura visual clara y libre de estímulos innecesarios o estridentes.
- Refuerzo positivo incondicional: Lumi, el compañero digital, no juzga ni pierde nivel.
- Eliminación de dinámicas punitivas o contadores destructivos.
- Canal de información transparente para coordinar avances con terapeutas.

La aplicación aspira a ser una aliada cotidiana en el hogar, en perfecta sintonía con las intervenciones terapéuticas. Podéis conocer el proyecto en https://miratea.es.

¿Sería factible agendar una breve videollamada para presentárosla y conocer vuestras impresiones?

Un saludo muy cordial,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    },
    {
        "id": 14,
        "nombre": "Crece con Dabadá",
        "categoria": "TEA",
        "ubicacion": "Churra, Murcia",
        "email": "crececondabada@crececondabada.org",
        "prioridad": 3,
        "asunto": "MIRATEA: autonomía cotidiana y autorregulación para jóvenes y familias TEA",
        "cuerpo": """Hola,

Me llamo Xavi Alonso y soy el desarrollador de MIRATEA (https://miratea.es), una plataforma orientada a fomentar la autonomía cotidiana, la autorregulación y la gestión de metas en personas neurodivergentes.

Conozco vuestro foco diferencial e innovador en las etapas de preadolescencia y adolescencia en el espectro autista, momentos donde la adquisición de autonomía personal y la gestión emocional cobran un papel determinante. Por ello, considero que MIRATEA puede ser especialmente afín a vuestro trabajo.

La herramienta cuida especialmente el respeto evolutivo y la madurez del usuario:

- Descomposición de metas personales y responsabilidades cotidianas en pasos lógicos asumibles, sin recurrir a lenguajes condescendientes o infantilizados.
- Rincón de Calma para gestionar momentos de sobrecarga cognitiva o frustración social mediante técnicas de respiración y descanso sensorial.
- Cero punición: la motivación se sostiene en el logro propio y no en rachas estresantes.
- Lumi, una compañía discreta y de apoyo constante.
- Resúmenes de hábitos que refuerzan la comunicación entre el joven, su familia y el equipo de apoyo.

Me encantaría tener la oportunidad de mostraros el entorno en una breve reunión telemática de 15 minutos y escuchar vuestro punto de vista especializado. Podéis ver la web en https://miratea.es. ¿Cómo tenéis la disponibilidad en las próximas semanas?

Un saludo cordial,
Xavi Alonso
MIRATEA by Solutech
https://miratea.es
xavi@miratea.es"""
    }
]

def get_existing_log():
    if os.path.exists(LOG_JSON_FILE):
        try:
            with open(LOG_JSON_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def sync_markdown_doc(logs):
    """Actualiza la tabla de log en OUTREACH_ASOCIACIONES_MURCIA.md"""
    if not os.path.exists(DOC_MD_FILE):
        return
    try:
        with open(DOC_MD_FILE, "r", encoding="utf-8") as f:
            content = f.read()

        header_marker = "## 6. Registro de Envíos y Log de Seguimiento (Tiempo Real)"
        if header_marker not in content:
            return

        table_header = """## 6. Registro de Envíos y Log de Seguimiento (Tiempo Real)

| id_contacto | nombre_asociacion | email | fecha_hora_envio | asunto_usado | estado | notas |
|:---:|---|---|:---:|---|:---:|---|"""

        log_map = {item.get("id_contacto"): item for item in logs}

        rows = []
        for c in CONTACTOS:
            c_id = c["id"]
            if c_id in log_map:
                entry = log_map[c_id]
                f_envio = entry.get("fecha_hora_envio") or "-"
                est = entry.get("estado", "preparado")
                notas = entry.get("notas", "")
            else:
                f_envio = "-"
                est = "preparado"
                notas = f"Prioridad {c['prioridad']}"

            row = f"| {c_id} | {c['nombre']} | `{c['email']}` | {f_envio} | {c['asunto']} | **{est}** | {notas} |"
            rows.append(row)

        # Entidades fijas especiales (17, 19, 20)
        rows.append("| 17 | ADA+HI | `adahimurcia@hotmail.com` | - | - | **deduplicado** | Reserva para no saturar ID 15 |")
        rows.append("| 19 | FEAADAH | Formulario web | - | - | **manual_pendiente** | Web: `feaadah.org/es/contacto` |")
        rows.append("| 20 | aMuACI | Formulario web | - | - | **manual_pendiente** | Web: `amuaci.es/contacto` |")

        new_section = table_header + "\n" + "\n".join(rows) + "\n"

        base_part = content.split(header_marker)[0]
        with open(DOC_MD_FILE, "w", encoding="utf-8") as f:
            f.write(base_part + new_section)
    except Exception as e:
        print(f"[MD] Error al sincronizar markdown: {e}", flush=True)

def save_log_entry(entry):
    logs = get_existing_log()
    updated = False
    for i, item in enumerate(logs):
        if item.get("email") == entry.get("email") and item.get("id_contacto") == entry.get("id_contacto"):
            logs[i] = entry
            updated = True
            break
    if not updated:
        logs.append(entry)
    with open(LOG_JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)
    sync_markdown_doc(logs)

def check_inbox_replies(env):
    """Revisa el buzón de entrada IMAP para comprobar si alguna asociación ha respondido."""
    try:
        mail = imaplib.IMAP4_SSL(env.get("IMAP_HOST", "imap.ionos.es"), int(env.get("IMAP_PORT", 993)))
        mail.login(env.get("IMAP_USER", "xavi@miratea.es"), env.get("IMAP_PASS"))
        mail.select("inbox")
        status, messages = mail.search(None, "ALL")
        if status != "OK" or not messages[0]:
            mail.logout()
            return []
        
        replies = []
        msg_ids = messages[0].split()
        for msg_id in msg_ids[-20:]:  # últimos 20 correos
            res, msg_data = mail.fetch(msg_id, "(RFC822)")
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    sender = msg.get("From", "")
                    subject = msg.get("Subject", "")
                    replies.append({"from": sender, "subject": subject})
        mail.logout()
        return replies
    except Exception as e:
        print(f"[IMAP] Advertencia al verificar buzón: {e}", flush=True)
        return []

def send_email_smtp(env, to_email, subject, body_text):
    smtp_host = env.get("SMTP_HOST", "smtp.ionos.es")
    smtp_port = int(env.get("SMTP_PORT", 587))
    smtp_user = env.get("SMTP_USER", "xavi@miratea.es")
    smtp_pass = env.get("SMTP_PASS")
    sender_display = "Xavi Alonso <xavi@miratea.es>"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender_display
    msg["To"] = to_email
    msg["Reply-To"] = "xavi@miratea.es"
    msg["Date"] = email.utils.formatdate(localtime=True)
    msg["Message-ID"] = email.utils.make_msgid(domain="miratea.es")

    part_text = MIMEText(body_text, "plain", "utf-8")
    msg.attach(part_text)

    server = smtplib.SMTP(smtp_host, smtp_port, timeout=20)
    server.ehlo()
    server.starttls()
    server.ehlo()
    server.login(smtp_user, smtp_pass)
    server.sendmail(smtp_user, [to_email], msg.as_string())
    server.quit()

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Envío escalonado de emails institucionales MIRATEA")
    parser.add_argument("--priority", choices=["1", "2", "3", "all"], default="all", help="Prioridad a enviar (1, 2, 3 o all)")
    parser.add_argument("--delay", type=int, default=180, help="Segundos de espera entre envíos (default: 180s = 3 min)")
    parser.add_argument("--dry-run", action="store_true", help="Simulación sin enviar correos reales")
    args = parser.parse_args()

    env = load_env()
    if not env.get("SMTP_PASS") and not args.dry_run:
        print("ERROR: SMTP_PASS no encontrada en .env.local", file=sys.stderr)
        sys.exit(1)

    # Filtrar contactos
    if args.priority == "all":
        contactos_a_enviar = CONTACTOS
    else:
        p_val = int(args.priority)
        contactos_a_enviar = [c for c in CONTACTOS if c["prioridad"] == p_val]

    # Ordenar estrictamente por prioridad (1 -> 2 -> 3)
    contactos_a_enviar.sort(key=lambda x: (x["prioridad"], x["id"]))

    existing_logs = {item["email"]: item for item in get_existing_log()}

    print("=" * 70, flush=True)
    print(f"🚀 INICIANDO CAMPAÑA DE OUTREACH MIRATEA — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
    print(f"   Objetivo: {len(contactos_a_enviar)} contactos únicos", flush=True)
    print(f"   Filtro: Prioridad {args.priority} | Espaciado: {args.delay} segundos", flush=True)
    print(f"   Modo: {'DRY-RUN (Simulación)' if args.dry_run else 'ENVÍO REAL SMTP (xavi@miratea.es)'}", flush=True)
    print("=" * 70, flush=True)

    sent_count = 0
    failed_count = 0
    skipped_count = 0

    for idx, c in enumerate(contactos_a_enviar):
        target_email = c["email"]
        
        # Verificar si ya fue enviado previamente con éxito
        if target_email in existing_logs and existing_logs[target_email].get("estado") == "enviado":
            print(f"[{idx+1}/{len(contactos_a_enviar)}] OMITIDO: {c['nombre']} ({target_email}) ya fue enviado el {existing_logs[target_email].get('fecha_hora_envio')}.", flush=True)
            skipped_count += 1
            continue

        print(f"\n--- [{idx+1}/{len(contactos_a_enviar)}] Procesando P{c['prioridad']}: {c['nombre']} ({target_email}) ---", flush=True)
        print(f"    Asunto: {c['asunto']}", flush=True)

        # Regla 8.3: Revisar si hay respuestas entrantes antes de continuar
        if not args.dry_run:
            inbox_items = check_inbox_replies(env)
            if inbox_items:
                print(f"    [IMAP] Mensajes recientes en bandeja de entrada: {len(inbox_items)}", flush=True)

        if args.dry_run:
            print(f"    [DRY-RUN] Simulación exitosa para {target_email}", flush=True)
            status = "dry_run_listo"
            error_note = ""
        else:
            try:
                send_email_smtp(env, target_email, c["asunto"], c["cuerpo"])
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                print(f"    ✅ [ENVIADO CON ÉXITO] Timestamp: {timestamp}", flush=True)
                status = "enviado"
                error_note = ""
                sent_count += 1
            except Exception as ex:
                print(f"    ❌ [FALLO EN EL ENVÍO]: {ex}", flush=True)
                # Regla 6.7: reintentar máximo una sola vez
                time.sleep(5)
                try:
                    print("    🔄 Reintentando envío único...", flush=True)
                    send_email_smtp(env, target_email, c["asunto"], c["cuerpo"])
                    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    print(f"    ✅ [ENVIADO EN REINTENTO] Timestamp: {timestamp}", flush=True)
                    status = "enviado"
                    error_note = "Enviado tras reintento"
                    sent_count += 1
                except Exception as ex2:
                    print(f"    ❌ [FALLIDO DEFINITIVO]: {ex2}", flush=True)
                    status = "fallido"
                    error_note = str(ex2)
                    failed_count += 1

        # Registrar log en tiempo real
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = {
            "id_contacto": c["id"],
            "nombre_asociacion": c["nombre"],
            "email": target_email,
            "categoria": c["categoria"],
            "ubicacion": c["ubicacion"],
            "prioridad": c["prioridad"],
            "fecha_hora_envio": now_str if status == "enviado" else None,
            "asunto_usado": c["asunto"],
            "estado": status,
            "notas": error_note or f"Prioridad {c['prioridad']}"
        }
        save_log_entry(entry)

        # Si quedan más correos y no es dry-run, aplicar delay de seguridad
        if idx < len(contactos_a_enviar) - 1:
            wait_time = args.delay if not args.dry_run else 1
            print(f"    ⏳ Esperando {wait_time} segundos antes del siguiente envío (espaciado de seguridad)...", flush=True)
            time.sleep(wait_time)

    print("\n" + "=" * 70, flush=True)
    print("🏁 RESUMEN DE EJECUCIÓN", flush=True)
    print(f"   Total procesados: {len(contactos_a_enviar)}", flush=True)
    print(f"   Enviados con éxito: {sent_count}", flush=True)
    print(f"   Omitidos (ya enviados): {skipped_count}", flush=True)
    print(f"   Fallidos: {failed_count}", flush=True)
    print(f"   Log actualizado en: {LOG_JSON_FILE}", flush=True)
    print("=" * 70, flush=True)

if __name__ == "__main__":
    main()
