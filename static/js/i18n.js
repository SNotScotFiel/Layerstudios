/**
 * Layer Studios - Complete Internationalization (i18n) Engine (PT-PT / EN)
 * Complete natural Portuguese (PT-PT) and English translation covering every single section,
 * hero copy, 3D viewer HUD, service cards, workflow steps, portfolio items, B2B, FAQ,
 * contact form, store products, materials matrix, and live tracking.
 */

const LS_PHRASES = [
  // Nav
  ['Home', 'Início'],
  ['Get a Quote', 'Pedir Orçamento'],
  ['Store', 'Loja'],
  ['Materials', 'Materiais'],
  ['Track Order', 'Seguir Encomenda'],
  ['Live Status', 'Estado em Direto'],
  ['New Quote →', 'Novo Orçamento →'],
  ['New Quote', 'Novo Orçamento'],
  ['Exit to Site', 'Voltar ao Site'],

  // Hero Section & Badges
  ['Studio based in Portugal • Tracked delivery across Portugal & EU', 'Estúdio sediado em Portugal • Envio registado em Portugal e na UE'],
  ['Studio based in Portugal · Tracked delivery across Portugal & EU', 'Estúdio sediado em Portugal · Envio registado em Portugal e na UE'],
  ['Studio open in Portugal • EU delivery in 24–48h', 'Estúdio sediado em Portugal • Envio registado em Portugal e na UE'],
  ['You imagine it.', 'Tu imaginas.'],
  ['We print it.', 'Nós imprimimos.'],
  ['Custom 3D printing, rapid prototyping, and replacement parts made simple. Upload your CAD file or send us a sketch with dimensions — we\'ll inspect, slice, and manufacture your physical parts.', 'Impressão 3D sob medida, prototipagem rápida e peças de substituição sem complicações. Envie o seu ficheiro CAD ou esboço cotado — inspecionamos, fatiamos e produzimos as suas peças físicas.'],
  ['Upload 3D File • Instant Quote', 'Carregar Ficheiro 3D • Orçamento Imediato'],
  ['Upload 3D File · Instant Quote', 'Carregar Ficheiro 3D · Orçamento Imediato'],
  ['Upload 3D File • Instant Quote →', 'Carregar Ficheiro 3D • Orçamento Imediato →'],
  ['Browse Store Catalog', 'Explorar Catálogo da Loja'],
  ['Typical FDM Fit', 'Ajuste Típico FDM'],
  ['Calibrated Precision', 'Precisão Calibrada'],
  ['Build Volume', 'Volume de Impressão'],
  ['Standard Production', 'Produção Padrão'],
  ['2–4 Days', '2–4 Dias Úteis'],
  ['±0.2 mm', '±0.2 mm'],
  ['256³ mm', '256³ mm'],

  // 3 Core Pillars
  ['Fast Local Production', 'Produção Local Rápida'],
  ['Direct manufacturing in Portugal with tracked domestic courier and European postal delivery.', 'Fabrico direto em Portugal com envio expresso nacional e correio registado europeu.'],
  ['Direct-drive motion systems calibrated for layer bonding, dimensional consistency, and clean surface finishes.', 'Sistemas de acionamento direto calibrados para união sólida entre camadas, estabilidade dimensional e acabamentos limpos.'],
  ['Friendly for Beginners', 'Acessível a Iniciantes'],
  ['No 3D experience needed. We inspect every model, fix manifold errors, and recommend the best settings.', 'Sem necessidade de experiência em 3D. Inspecionamos cada modelo, corrigimos erros geométricos e recomendamos as melhores definições.'],

  // Capabilities & Services Section
  ['Capabilities', 'Capacidades'],
  ['Full-Spectrum Manufacturing & CAD Design', 'Fabrico Abrangente & Modelação CAD'],
  ['Full-Spectrum Manufacturing &amp; CAD Design', 'Fabrico Abrangente & Modelação CAD'],
  ['Whether you have a ready CAD model or just a broken plastic part you need replicated, Layer Studios provides end-to-end service.', 'Quer tenha um modelo CAD pronto ou apenas uma peça partida para replicar, a Layer Studios oferece um serviço completo de ponta a ponta.'],
  
  ['Rapid Prototyping', 'Prototipagem Rápida'],
  ['Turn digital CAD concepts into testable physical models in hours. Test ergonomic fit, mechanics, and form factor before investing in expensive tooling.', 'Transforme conceitos digitais em modelos físicos testáveis em poucas horas. Valide ergonomia, mecânica e encaixes antes de investir em moldes caros.'],
  ['Request prototype quote', 'Pedir orçamento de protótipo'],
  ['Request prototype quote →', 'Pedir orçamento de protótipo →'],

  ['Small-Batch Production', 'Produção em Pequena Série'],
  ['Produce from 5 to 100+ end-use parts without injection mould upfront costs. Ideal for market testing, custom electronic enclosures, and bespoke hardware.', 'Produza de 5 a 100+ peças finais sem custos de moldes de injeção. Ideal para validação de produto, caixas de eletrónica e hardware sob medida.'],
  ['Calculate batch pricing', 'Calcular preço de série'],
  ['Calculate batch pricing →', 'Calcular preço de série →'],

  ['Replacement & Obsolete Parts', 'Peças de Substituição & Descontinuadas'],
  ['Replacement &amp; Obsolete Parts', 'Peças de Substituição & Descontinuadas'],
  ['Discontinued appliance gears, broken car trim clips, drone arms, or vacuum mounts. Send us caliper measurements or fragments for 1:1 replacement.', 'Engrenagens de eletrodomésticos, molas de friso automóvel partidas, braços de drone ou suportes. Envie medidas ou fragmentos para substituição 1:1.'],
  ['Send broken part photo', 'Enviar foto da peça partida'],
  ['Send broken part photo →', 'Enviar foto da peça partida →'],

  ['CAD & Reverse Engineering', 'Modelação CAD & Engenharia Inversa'],
  ['CAD &amp; Reverse Engineering', 'Modelação CAD & Engenharia Inversa'],
  ['No 3D file? We create precision STEP and STL solid CAD files from dimensioned sketches, technical drawings, or physical samples.', 'Sem ficheiro 3D? Criamos ficheiros CAD sólidos de precisão (STEP e STL) a partir de esboços cotados, desenhos técnicos ou amostras físicas.'],

  ['Post-Processing & Finishing', 'Pós-Processamento & Acabamentos'],
  ['Post-Processing &amp; Finishing', 'Pós-Processamento & Acabamentos'],
  ['Multi-grit surface preparation, brass heat-set threaded inserts, mechanical deburring, and structural assembly bonding.', 'Preparação de superfícies com várias lixas, inserções roscadas em latão a quente, rebarbação e colagem estrutural.'],
  ['Explore finishing options', 'Ver opções de acabamento'],
  ['Explore finishing options →', 'Ver opções de acabamento →'],

  ['Material Selection Advisory', 'Consultoria e Escolha de Materiais'],
  ['Get practical engineering guidance on selecting between PLA+, PETG, ABS, TPU 95A, and Carbon-Fiber composites based on mechanical load, temperature, and UV exposure.', 'Aconselhamento técnico na escolha entre PLA+, PETG, ABS, TPU 95A e compósitos de carbono consoante carga mecânica, temperatura e exposição UV.'],
  ['Try Materials Advisor Quiz', 'Fazer o Teste do Consultor de Materiais'],
  ['Try Materials Advisor Quiz →', 'Fazer o Teste do Consultor de Materiais →'],

  // How It Works / Workflow
  ['Workflow', 'Fluxo de Trabalho'],
  ['Simple 4-Step Production Process', 'Processo Simples de Fabrico em 4 Passos'],
  ['We designed our studio workflow so you can go from digital idea to finished product seamlessly.', 'Estruturámos o nosso fluxo de trabalho para transformar a sua ideia digital numa peça física sem complicações.'],
  ['Upload or Request', '1. Carregar ou Pedir Orçamento'],
  ['Drop your STL/3MF/STEP file or upload sketches/photos. Choose your material, colour, and quantity.', 'Envie o seu ficheiro STL/3MF/STEP ou fotos com medidas. Escolha o material, cor e quantidade.'],
  ['Slicing & Printability Review', '2. Análise de Fatiamento e Imprimibilidade'],
  ['We inspect your geometry, optimize layer orientation for strength, and confirm print parameters before starting production.', 'Analisamos a geometria, otimizamos a orientação de camadas para resistência mecânica e confirmamos os parâmetros antes de iniciar o fabrico.'],
  ['Precision Printing', '3. Impressão de Alta Precisão'],
  ['Manufactured on calibrated direct-drive machines with multi-point automated bed leveling.', 'Fabrico em máquinas de acionamento direto com nivelamento automático multiponto de alta precisão.'],
  ['Quality & Delivery', '4. Controlo de Qualidade & Envio'],
  ['Quality &amp; Delivery', '4. Controlo de Qualidade & Envio'],
  ['Caliper inspection, support removal, packaging, and tracked express shipping straight to your door.', 'Inspeção com paquímetro digital, remoção de suportes, embalagem cuidada e envio registado até à sua porta.'],
  ['Start Your Custom Order →', 'Iniciar o Seu Pedido à Medida →'],

  // Portfolio / Capability Examples
  ['Capability Examples', 'Exemplos de Fabrico'],
  ['Demonstration Prints & Applications', 'Exemplos de Demonstração & Aplicações'],
  ['Demonstration Prints &amp; Applications', 'Exemplos de Demonstração & Aplicações'],
  ['Sample parts manufactured to illustrate surface quality, material properties, and mechanical design applications.', 'Peças de amostra produzidas para ilustrar a qualidade de acabamento, propriedades dos materiais e aplicações de desenho mecânico.'],
  ['All', 'Todos'],
  ['Prototyping', 'Prototipagem'],
  ['Replacement', 'Substituição'],
  ['Mechanical', 'Mecânica'],
  ['Example Part', 'Peça de Demonstração'],
  ['IoT Sensor Enclosure', 'Caixa para Sensor IoT'],
  ['Weather-resistant enclosure design featuring brass heat-set threaded inserts and silicone gasket sealing groove in PETG.', 'Design de caixa resistente às intempéries com inserções roscadas em latão a quente e ranhura para vedante de silicone em PETG.'],
  ['Material: PETG Black', 'Material: PETG Preto'],
  ['Lead: 24–48h', 'Prazo: 24–48h'],
  ['Vintage Kitchen Mixer Gear', 'Engrenagem para Batedeira Vintage'],
  ['Recreated obsolete helical gear modeled from caliper dimensions of original fragments with involute tooth profile.', 'Recriação de engrenagem helicoidal descontinuada modelada a partir de cotas dos fragmentos originais com perfil envolvente.'],
  ['Material: CF-PETG', 'Material: CF-PETG (Carbono)'],
  ['Layer: 0.16mm', 'Camada: 0.16mm'],
  ['Functional Mount', 'Suporte Funcional'],
  ['Telemetry Camera Rig', 'Suporte para Câmara de Telemetria'],
  ['Lightweight action camera bracket with flexible TPU dampening bushings for motorsport data logging.', 'Suporte leve com casquilhos flexíveis em TPU para amortecimento de vibrações em telemetria automóvel.'],
  ['Material: PETG + TPU', 'Material: PETG + TPU'],
  ['Weight: 42g', 'Peso: 42g'],

  // B2B Section
  ['B2B Prototyping', 'Prototipagem B2B'],
  ['Prototyping & Short Runs for Businesses', 'Prototipagem & Séries Curtas para Empresas'],
  ['Prototyping &amp; Short Runs for Businesses', 'Prototipagem & Séries Curtas para Empresas'],
  ['We support hardware startups, designers, and local businesses in Portugal with functional prototypes and short production runs. Strict file confidentiality, transparent quotes, and commercial invoices with NIF.', 'Apoiamos startups de hardware, designers e empresas em Portugal com protótipos funcionais e séries curtas. Confidencialidade rigorosa de ficheiros, orçamentos transparentes e faturas comerciais com NIF.'],
  ['Confidential File Handling', 'Tratamento Confidencial de Ficheiros'],
  ['Volume Discounts', 'Descontos de Quantidade'],
  ['Commercial Invoices (with NIF)', 'Faturas Comerciais com NIF'],
  ['Request Project Consultation →', 'Pedir Consulta de Projeto →'],
  ['Email: contact@layerstudios.pt', 'Email: contact@layerstudios.pt'],

  // Legal & Trust Modal Links
  ['Terms of Service', 'Termos e Condições'],
  ['Privacy Policy (GDPR)', 'Política de Privacidade (RGPD)'],
  ['Shipping & Delivery', 'Envios e Entregas'],
  ['Guarantee & Returns', 'Garantia e Devoluções'],
  ['Legal Notice & ADR', 'Aviso Legal e Litígios'],
  ['Livro de Reclamações', 'Livro de Reclamações'],
  ['Confidential project:', 'Projeto confidencial:'],
  ['I confirm that I own this design or have permission to have it manufactured', 'Confirmo que sou o titular deste desenho ou tenho autorização para o mandar produzir'],
  ['Technical review', 'Validação técnica prévia'],
  ['No account needed', 'Sem conta obrigatória'],

  // FAQ Section
  ['Frequently Asked Questions', 'Perguntas Frequentes'],
  ['Everything you need to know about ordering, files, materials, and delivery.', 'Tudo o que precisa de saber sobre pedidos, ficheiros, materiais e entregas.'],
  ['What 3D file formats do you accept?', 'Que formatos de ficheiro 3D aceitam?'],
  ['We accept all standard 3D formats including STL, 3MF, STEP (.step/.stp), and OBJ. For CAD design or reverse-engineering, you can also upload dimensioned PDF drawings, sketches, or photos.', 'Aceitamos todos os formatos 3D padrão incluindo STL, 3MF, STEP (.step/.stp) e OBJ. Para modelação CAD de raiz ou engenharia inversa, também pode enviar desenhos técnicos em PDF com cotas, esboços ou fotos.'],
  ['What is your maximum build volume?', 'Qual é o volume máximo de impressão?'],
  ['Our standard single-piece build volume is 256 × 256 × 256 mm. Larger models can be split with alignment pin joints and assembled seamlessly with structural bonding.', 'A nossa área útil de fabrico numa só peça é de 256 × 256 × 256 mm. Peças maiores podem ser fatiadas com uniões macho-fêmea de alinhamento e montadas de forma invisível com colagem estrutural.'],
  ['How fast is delivery within Portugal and the EU?', 'Qual é a rapidez de entrega em Portugal e na UE?'],
  ['Most orders print in 24–48 hours. Shipping in Portugal takes 24 hours via CTT Express (€4.50, free over €50). European Union deliveries take 2–4 business days via DHL/UPS.', 'A maioria das encomendas é impressa em 24–48 horas. O envio em Portugal continental demora 24h via CTT Expresso (€4.50, grátis acima de €50). Para a União Europeia demora 2–4 dias úteis.'],
  ['I have never ordered a 3D print before. What should I do?', 'Nunca encomendei uma impressão 3D. Como devo fazer?'],
  ['It\'s completely painless! Head to our Get a Quote page and drag your file into the box. If you don\'t have a 3D file, switch to "I need it designed" and write a description. We will guide you step by step.', 'É muito simples! Aceda à página Pedir Orçamento e arraste o seu ficheiro para a caixa. Se não tiver ficheiro 3D, mude para "Preciso de Desenho CAD" e descreva o que pretende. Acompanhamos todo o processo passo a passo.'],

  // About & Contact Form
  ['About Layer Studios', 'Sobre a Layer Studios'],
  ['Precision Studio Based in Portugal', 'Estúdio de Precisão Sediado em Portugal'],
  ['Layer Studios was founded with a clear mission: making custom manufacturing and functional prototyping accessible to everyone without friction.', 'A Layer Studios nasceu com uma missão clara: tornar o fabrico sob medida e a prototipagem funcional acessíveis a criadores e empresas com a máxima qualidade.'],
  ['Studio Location:', 'Localização do Estúdio:'],
  ['Lisbon, Portugal', 'Lisboa, Portugal'],
  ['Working Hours:', 'Horário de Funcionamento:'],
  ['Mon–Fri 09:00–18:30 WET', 'Seg–Sex 09:00–18:30 WET'],
  ['Send Us a Direct Message', 'Envie-nos uma Mensagem Direta'],
  ['Have a custom inquiry or engineering question? Our team responds within 2 hours.', 'Tem alguma dúvida técnica ou projeto especial? A nossa equipa responde no próprio dia.'],
  ['Your Name', 'O Seu Nome'],
  ['Subject', 'Assunto'],
  ['Message', 'Mensagem'],
  ['Project consultation / CAD inquiry', 'Consultoria de projeto / Pedido de modelação CAD'],
  ['Tell us about what you\'d like to manufacture...', 'Descreva o projeto ou peça que pretende produzir...'],
  ['Send Message →', 'Enviar Mensagem →'],

  // Footer Links
  ['Dedicated Pages', 'Páginas do Site'],
  ['Instant 3D Quoting Studio', 'Estúdio de Orçamentos 3D'],
  ['Ready-Made Product Store', 'Loja de Produtos Impressos'],
  ['Engineering Materials Guide', 'Guia de Materiais de Engenharia'],
  ['Live Order Tracker', 'Seguir Encomenda em Direto'],
  ['Services', 'Serviços'],
  ['Studio', 'Estúdio'],
  ['About Our Studio', 'Sobre o Nosso Estúdio'],
  ['Recent Projects', 'Projetos Recentes'],
  ['B2B & Enterprise', 'B2B & Empresas'],
  ['Contact & Workshop', 'Contactos & Oficina'],
  ['© 2026 Layer Studios. All rights reserved. Portugal • EU.', '© 2026 Layer Studios. Todos os direitos reservados. Portugal • UE.'],

  // Payment Modal & Tracker
  ['Layer Studios Secure Checkout', 'Checkout Seguro Layer Studios'],
  ['256-Bit SSL Encrypted Gateway', 'Gateway Encriptada SSL de 256-Bits'],
  ['Total to Pay', 'Total a Pagar'],
  ['Order Reference', 'Referência da Encomenda'],
  ['One-Click Checkout', 'Pagamento Rápido em 1 Clique'],
  ['Pay with Apple Pay / Google Pay / Card', 'Pagar com Apple Pay / Google Pay / Cartão'],
  ['Pay securely using Apple Pay, Google Pay, or any Credit/Debit Card. Processed directly through Stripe with end-to-end encryption.', 'Pague com total segurança através de Apple Pay, Google Pay ou Cartão de Débito/Crédito. Processado diretamente via Stripe com encriptação de ponta a ponta.'],
  ['Instant & Direct', 'Instantâneo & Direto'],
  ['Push Notification', 'Notificação Push'],
  ['Entity & Ref', 'Entidade & Ref.'],
  ['Production Launch', 'Lançamento de Produção'],
  ['Pay & Start Production →', 'Pagar & Iniciar Produção →'],
  ['Complete payment of', 'Conclua o pagamento de'],
  ['to start printing', 'para iniciar a impressão'],

  // Account & Customer Portal
  ['Account', 'Conta'],
  ['My Account', 'Minha Conta'],
  ['Customer Portal', 'Área de Cliente'],
  ['Secure Customer Portal', 'Área de Cliente Segura'],
  ['Welcome to Layer Studios', 'Bem-vindo à Layer Studios'],
  ['Access your orders, quotes, and live manufacturing updates.', 'Aceda às suas encomendas, orçamentos e notificações em direto.'],
  ['Log In', 'Iniciar Sessão'],
  ['Sign Up', 'Criar Conta'],
  ['Guest', 'Convidado'],
  ['Guest Access', 'Acesso de Convidado'],
  ['Guest Access (No Account Required)', 'Acesso de Convidado (Sem Conta)'],
  ['No password required. Enter your email address or Order/Quote Reference to view your orders immediately.', 'Não precisa de criar palavra-passe. Basta introduzir o seu email ou o código da sua encomenda/orçamento para aceder de imediato.'],
  ['Email address', 'Email'],
  ['Password', 'Palavra-passe'],
  ['Forgot password?', 'Esqueceu-se?'],
  ['Log In to Account →', 'Entrar na Conta →'],
  ['Full Name', 'Nome Completo'],
  ['Phone (optional)', 'Telemóvel (opcional)'],
  ['Create Secure Account →', 'Criar Conta Segura →'],
  ['Email or Reference (LS-XXXX / ORD-XXXX)', 'Email ou Referência (LS-XXXX / ORD-XXXX)'],
  ['Lookup Orders →', 'Consultar Encomendas →'],
  ['256-Bit SSL Encrypted', '256-Bit SSL Encriptado'],
  ['Instant Access', 'Acesso Instantâneo'],
  ['Layer Studios Client', 'Cliente Layer Studios'],
  ['+ New 3D Quote', '+ Novo Orçamento 3D'],
  ['Log Out ✕', 'Sair ✕'],
  ['Log Out', 'Sair'],
  ['Quotes', 'Orçamentos'],
  ['In Production', 'Em Impressão'],
  ['Store Orders', 'Encomendas Loja'],
  ['My Orders & 3D Quotes', 'As Minhas Encomendas & Orçamentos 3D'],
  ['Real-Time Updates', 'Atualizações em Tempo Real'],
  ['You have no quotes or orders yet', 'Ainda não tem encomendas ou orçamentos'],
  ['Upload a 3D file to get an instant quote or explore our ready-to-ship store products.', 'Carregue um ficheiro 3D para obter um orçamento imediato ou explore os produtos prontos na loja.'],
  ['New 3D Quote →', 'Novo Orçamento 3D →'],
  ['Browse Store', 'Ver Loja'],
  ['Track →', 'Seguir →'],
  ['Quantity', 'Quantidade'],
  ['Payment', 'Pagamento'],
  ['Date', 'Data'],
  ['Today', 'Hoje'],
  ['Pending', 'Pendente'],
  ['Paid', 'Pago'],
  ['✓ Paid', '✓ Pago'],
  ['Complete payment to initiate immediate production.', 'Conclua o pagamento para iniciar a produção imediata.'],
  ['Pay Now →', 'Pagar Agora →'],
  ['Pay Now', 'Pagar Agora'],
  ['Store', 'Loja'],
  ['Custom 3D Print Request', 'Impressão 3D Personalizada'],
  ['Sign In / Sign Up', 'Entrar / Criar Conta'],
  ['Notification Center', 'Centro de Notificações'],
  ['Live Production Alerts', 'Live Production Alerts'],
  ['Clear', 'Limpar'],
  ['Track Order', 'Seguir Encomenda'],
  ['Live Status', 'Estado em Direto'],
  ['Transparent pricing', 'Preços transparentes'],
  ['Material cost', 'Custo de material'],
  ['Print time', 'Tempo de impressão'],
  ['Post-processing', 'Pós-processamento'],
  ['Shipping', 'Envio'],
  ['Total Estimate', 'Total Estimado'],
  ['Send Quote Request →', 'Enviar Pedido de Orçamento →'],
  ['No account needed', 'Sem necessidade de conta'],
  ['Reply within 2h', 'Resposta em menos de 2h'],
  ['Upload 3D model to preview', 'Carregue modelo 3D para pré-visualizar'],
  ['Instant Estimate', 'Orçamento Instantâneo'],

  // Materials Center & Quiz
  ['Engineering Thermoplastics • High Performance Composites', 'Termoplásticos de Engenharia • Compósitos de Alto Desempenho'],
  ['Engineering Materials Center', 'Centro de Materiais de Engenharia'],
  ['From rigid aesthetic biopolymers and impact-resistant co-polyesters to flexible rubber elastomers and ultra-stiff carbon-fiber composites. Compare mechanical ratings, thermal limits, and find the perfect filament for your design.', 'Desde biopolímeros estéticos e copoliésteres resistentes ao impacto até elastómeros flexíveis e compósitos de fibra de carbono ultra-rígidos. Compare classificações mecânicas, limites térmicos e encontre o filamento ideal para o seu projeto.'],
  ['Interactive Decision Tool', 'Ferramenta Interativa de Decisão'],
  ['INTERACTIVE DECISION TOOL', 'FERRAMENTA INTERATIVA DE DECISÃO'],
  ['Material Advisor Quiz', 'Quiz de Recomendação de Material'],
  ['Answer 3 simple questions to receive an instant engineering recommendation.', 'Responda a 3 perguntas simples para receber uma recomendação técnica imediata.'],
  ['Instant Match', 'Recomendação Imediata'],
  ['1. Primary Application', '1. Aplicação Principal'],
  ['1. PRIMARY APPLICATION', '1. APLICAÇÃO PRINCIPAL'],
  ['Display / Visual Prototype / Figurine', 'Exibição / Protótipo Visual / Figura'],
  ['Functional Bracket / Mechanism / Enclosure', 'Suporte Funcional / Mecanismo / Caixa'],
  ['Grip / Gasket / Bumper / Flexible Cover', 'Pega / Vedante / Amortecedor / Capa Flexível'],
  ['Automotive / High Load / Drone Rig', 'Automóvel / Carga Elevada / Estrutura Drone'],
  ['2. Operating Temperature', '2. Temperatura de Operação'],
  ['2. OPERATING TEMPERATURE', '2. TEMPERATURA DE OPERAÇÃO'],
  ['Room Temperature (Under 50°C / Indoor)', 'Temperatura Ambiente (Abaixo de 50°C / Interior)'],
  ['Outdoor / Direct Sunlight / Mild Heat (50–75°C)', 'Exterior / Luz Solar Direta / Calor Moderado (50–75°C)'],
  ['Outdoor / Direct Sunlight / Mild Heat (50-75°C)', 'Exterior / Luz Solar Direta / Calor Moderado (50–75°C)'],
  ['Under-the-Hood / High Heat (80–120°C+)', 'Sob o Capô / Calor Elevado (80–120°C+)'],
  ['Under-the-Hood / High Heat (80-120°C+)', 'Sob o Capô / Calor Elevado (80–120°C+)'],
  ['3. Mechanical Stress', '3. Esforço Mecânico'],
  ['3. MECHANICAL STRESS', '3. ESFORÇO MECÂNICO'],
  ['Low / Static weight only', 'Baixo / Apenas peso estático'],
  ['Moderate / Repeated handling & impacts', 'Moderado / Manuseamento repetido & impactos'],
  ['Moderate / Repeated handling &amp; impacts', 'Moderado / Manuseamento repetido & impactos'],
  ['Heavy mechanical load / Extreme stiffness', 'Carga mecânica pesada / Rigidez extrema'],
  ['Recommended Material:', 'Material Recomendado:'],
  ['RECOMMENDED MATERIAL:', 'MATERIAL RECOMENDADO:'],
  ['PETG offers the ideal balance of impact resistance, weather resistance, and thermal tolerance up to 75°C.', 'O PETG oferece o equilíbrio ideal de resistência ao impacto, intempéries e tolerância térmica até 75°C.'],
  ['TPU 95A is flexible, shock-absorbing, and virtually indestructible under impacts and vibrations.', 'O TPU 95A é flexível, absorve choques e é praticamente indestrutível sob impactos e vibrações.'],
  ['PLA+ provides the crispest surface details, sharpest edges, and most cost-effective prototyping turnaround.', 'O PLA+ oferece os detalhes mais nítidos, arestas definidas e o ciclo de prototipagem mais económico.'],
  ['Carbon-Fiber CF-Nylon', 'Fibra de Carbono CF-Nylon'],
  ['CF-Nylon delivers maximum structural stiffness, thermal resistance up to 120°C+, and high strength.', 'O CF-Nylon oferece máxima rigidez estrutural, resistência térmica até 120°C+ e elevada resistência.'],
  ['Carbon-fiber reinforced composite engineered for high mechanical loads and zero flexing.', 'Compósito reforçado com fibra de carbono projetado para altas cargas mecânicas e flexão zero.'],
  ['Ideal balance of mechanical tensile strength, impact absorption, and temperature resistance up to 75°C.', 'Equilíbrio ideal de resistência à tração mecânica, absorção de choque e resistência à temperatura até 75°C.'],
  ['PETG Co-Polyester', 'Co-Poliéster PETG'],
  ['Use in Quote Request →', 'Usar no Orçamento →'],
  ['Full Material Specifications', 'Especificações Completas dos Materiais'],
  ['Detailed performance ratings, typical applications, and material properties.', 'Classificações detalhadas de desempenho, aplicações típicas e propriedades dos materiais.'],
  ['(Affordable)', '(Económico)'],
  ['(AFFORDABLE)', '(ECONÓMICO)'],
  ['(Standard)', '(Padrão)'],
  ['(STANDARD)', '(PADRÃO)'],
  ['(Specialized)', '(Especializado)'],
  ['(SPECIALIZED)', '(ESPECIALIZADO)'],
  ['(Technical)', '(Técnico)'],
  ['(TECHNICAL)', '(TÉCNICO)'],
  ['(Premium)', '(Premium)'],
  ['(PREMIUM)', '(PREMIUM)'],
  ['€ (Affordable)', '€ (Económico)'],
  ['€€ (Standard)', '€€ (Padrão)'],
  ['€€€ (Specialized)', '€€€ (Especializado)'],
  ['€€€ (Technical)', '€€€ (Técnico)'],
  ['€€€€ (Premium)', '€€€€ (Premium)'],
  ['Polylactic Acid (Biopolymer)', 'Ácido Polilático (Biopolímero)'],
  ['Polyethylene Terephthalate Glycol', 'Polietileno Tereftalato Glicol'],
  ['Thermoplastic Polyurethane (Elastomer)', 'Poliuretano Termoplástico (Elastómero)'],
  ['Acrylonitrile Styrene Acrylate / ABS', 'Acrilonitrila Estireno Acrilato / ABS'],
  ['Carbon Fiber Reinforced Composite', 'Compósito Reforçado com Fibra de Carbono'],
  ['Best for visual prototypes, display models, and cost-effective general parts.', 'Ideal para protótipos visuais, modelos de exposição e peças gerais económicas.'],
  ['The ultimate everyday engineering material: tough, heat-resistant, and weather-proof.', 'O melhor material de engenharia do dia a dia: resistente, suporta calor e intempéries.'],
  ['Rubber-like flexibility, extreme impact absorption, and tear resistance.', 'Flexibilidade tipo borracha, extrema absorção de impacto e resistência a rasgões.'],
  ['Industrial-grade thermal resistance and extreme UV stability for automotive & outdoor use.', 'Resistência térmica industrial e extrema estabilidade UV para uso automóvel e exterior.'],
  ['Maximum rigidity, lightweight performance, and a stunning matte textured finish.', 'Máxima rigidez, desempenho leve e acabamento texturado mate incrível.'],
  ['Mechanical Strength', 'Resistência Mecânica'],
  ['Flexibility & Impact', 'Flexibilidade & Impacto'],
  ['Heat Resistance', 'Resistência Térmica'],
  ['Outdoor & UV Sun', 'Exterior & Raios UV'],
  ['Key Advantages', 'Principais Vantagens'],
  ['KEY ADVANTAGES', 'PRINCIPAIS VANTAGENS'],
  ['Select for Quote →', 'Selecionar para Orçamento →'],
  ['Engineering Comparison Matrix', 'Matriz de Comparação de Materiais'],
  ['Direct side-by-side technical reference table.', 'Tabela de referência técnica comparativa direta.'],
  ['Material', 'Material'],
  ['MATERIAL', 'MATERIAL'],
  ['Max Temp', 'Temp. Máxima'],
  ['MAX TEMP', 'TEMP. MÁXIMA'],
  ['Tensile Strength', 'Resistência à Tração'],
  ['TENSILE STRENGTH', 'RESISTÊNCIA À TRAÇÃO'],
  ['Impact / Flex', 'Impacto / Flexibilidade'],
  ['IMPACT / FLEX', 'IMPACTO / FLEXIBILIDADE'],
  ['UV / Outdoor', 'UV / Exterior'],
  ['UV / OUTDOOR', 'UV / EXTERIOR'],
  ['Cost Tier', 'Nível de Custo'],
  ['COST TIER', 'NÍVEL DE CUSTO'],
  ['Action', 'Ação'],
  ['ACTION', 'AÇÃO'],
  ['Quote →', 'Orçamento →'],
  ['Crisp surface finish with near-invisible layer lines at fine settings', 'Acabamento de superfície nítido com linhas de camada quase invisíveis'],
  ['High dimensional accuracy and low shrinkage', 'Elevada precisão dimensional e reduzida retração'],
  ['Most cost-effective material for rapid iterations', 'Material mais económico para iterações rápidas'],
  ['Bio-sourced and eco-friendly printing process', 'Processo de impressão de base biológica e ecológico'],
  ['Exceptional layer adhesion and impact resistance', 'Aderência entre camadas excecional e resistência ao impacto'],
  ['Resists outdoor UV exposure, moisture, and mild chemicals', 'Resiste à exposição solar UV, humidade e químicos ligeiros'],
  ['Higher thermal threshold (stable up to 75°C)', 'Maior limite térmico (estável até 75°C)'],
  ['Food-contact safe resin base', 'Base de resina segura para contacto alimentar'],
  ['Bendable, shock-absorbing, and virtually unbreakable under drops', 'Flexível, absorve choques e praticamente inquebrável em quedas'],
  ['Excellent abrasion and chemical resistance against grease and oils', 'Excelente resistência à abrasão e químicos contra óleos e gorduras'],
  ['Great grip and vibration dampening properties', 'Excelente aderência e propriedades de amortecimento de vibrações'],
  ['Withstands extreme heat up to 95-100°C without warping', 'Resiste a temperaturas extremas até 95-100°C sem deformação'],
  ['ASA is 100% UV resistant (does not yellow in continuous sun)', 'O ASA é 100% resistente aos raios UV (não amarela com sol contínuo)'],
  ['Can be post-processed, sanded, and acetone vapor smoothed', 'Pode ser pós-processado, lixado e alisado com vapor de acetona'],
  ['Infused with chopped micro-carbon fibers for extreme stiffness', 'Infundido com microfibras de carbono para rigidez extrema'],
  ['Zero visible layer lines thanks to matte micro-texture', 'Zero linhas de camada visíveis graças à microtextura mate'],
  ['High strength-to-weight ratio and dimensional stability', 'Elevada relação resistência-peso e estabilidade dimensional'],
  ['Instant Quote →', 'Pedir Orçamento →'],
  ['Instant Quote &rarr;', 'Pedir Orçamento &rarr;'],
  ['Materials Guide', 'Guia de Materiais'],

  // Quote Page & Form
  ['I have a 3D file', 'Tenho ficheiro 3D'],
  ['I need it designed', 'Preciso de desenho CAD'],
  ['Drop your 3D files here', 'Arraste os seus ficheiros 3D para aqui'],
  ['or click to browse', 'ou clique para escolher ficheiros'],
  ['click to browse', 'clique para escolher ficheiros'],
  ['STL · 3MF · STEP · OBJ · PDF drawings (max 50 MB)', 'STL · 3MF · STEP · OBJ · Desenhos PDF (máx. 50 MB)'],
  ['How it works:', 'Como funciona:'],
  ['Upload a sketch, photo of the broken part, or a dimensioned PDF. We\'ll create the 3D model and share it for your approval before printing.', 'Envie um esboço, foto da peça partida ou PDF cotado. Criamos o modelo 3D e partilhamos consigo para aprovação antes da impressão.'],
  ['What would you like us to design?', 'O que gostaria que desenhássemos?'],
  ['Describe the part — dimensions, purpose, material preference, how it mounts or connects...', 'Descreva a peça — dimensões aproximadas, finalidade, preferência de material, como encaixa ou fixa...'],
  ['Print Settings', 'Configurações de Impressão'],
  ['Rigid · Affordable', 'Rígido · Económico'],
  ['Strong · Heat resistant', 'Resistente · Térmico'],
  ['Tough · High temp', 'Robusto · Alta temp'],
  ['Flexible · Impact', 'Flexível · Impacto'],
  ['Premium · Ultra strong', 'Premium · Ultra forte'],
  ['More →', 'Mais →'],
  ['See all materials', 'Ver todos os materiais'],
  ['See all', 'Ver todos'],
  ['Print Quality', 'Qualidade de Impressão'],
  ['Fine (0.1mm)', 'Fina (0.1mm)'],
  ['Standard (0.2mm)', 'Padrão (0.2mm)'],
  ['Draft (0.3mm)', 'Rápida (0.3mm)'],
  ['Infill Strength', 'Preenchimento / Resistência'],
  ['Light (15%) — Display', 'Ligeiro (15%) — Exibição'],
  ['Standard (30%)', 'Padrão (30%)'],
  ['Strong (60%)', 'Resistente (60%)'],
  ['Solid (100%)', 'Maciço (100%)'],
  ['Preferred Colour', 'Cor Preferida'],
  ['e.g. Black, White, RAL 5015...', 'ex: Preto, Branco, RAL 5015...'],
  ['Your Details', 'Os Seus Dados'],
  ['Name', 'Nome'],
  ['Your full name', 'O seu nome completo'],
  ['Email', 'Email'],
  ['your@email.com', 'o.seu.email@exemplo.com'],
  ['Shipping Country', 'País de Envio'],
  ['Portugal (€4.50 · Free over €50)', 'Portugal (€4.50 · Grátis acima de €50)'],
  ['European Union (€9.90)', 'União Europeia (€9.90)'],
  ['International Tracked (€18.00)', 'Internacional Registado (€18.00)'],
  ['Confidential project:', 'Projeto confidencial:'],
  ['Do not photograph or display my part in portfolio showcases.', 'Não fotografar nem exibir a minha peça em portfólio.'],
  ['I confirm that I own this design or have permission to have it manufactured, and agree to the', 'Confirmo que detenho este design ou tenho autorização para o fabricar, e aceito os'],
  ['Terms of Service', 'Termos e Condições'],
  ['Privacy Policy', 'Política de Privacidade'],
  ['Additional notes', 'Notas adicionais'],
  ['e.g. M4 brass inserts required, smooth top surface...', 'ex: inserções roscadas M4 necessárias, acabamento liso superior...'],
  ['Model Analysis', 'Análise do Modelo'],
  ['Live 3D Preview', 'Pré-visualização 3D'],
  ['Size (mm)', 'Dimensões (mm)'],
  ['Volume', 'Volume'],
  ['Est. Filament', 'Filamento Estimado'],
  ['Print Time', 'Tempo de Impressão'],
  ['Estimated Cost', 'Custo Estimado'],
  ['Transparent pricing', 'Preços transparentes'],
  ['Material cost', 'Custo de material'],
  ['Print time', 'Tempo de impressão'],
  ['Post-processing', 'Pós-processamento'],
  ['Quantity ×', 'Quantidade ×'],
  ['Shipping', 'Envio'],
  ['Total Estimate', 'Total Estimado'],
  ['Instant estimate only. Final price and timeline confirmed upon printability review.', 'Estimativa instantânea. Preço e prazo finais confirmados após análise técnica.'],
  ['Send Quote Request →', 'Enviar Pedido de Orçamento →'],
  ['No account needed', 'Sem conta necessária'],
  ['Technical review', 'Validação técnica'],
  ['What formats do you accept?', 'Que formatos aceitam?'],
  ['How long does production take?', 'Quanto tempo demora a produção?'],
  ['What is your quality guarantee?', 'Qual é a garantia de qualidade?'],
  ['I don\'t have a 3D file — can you still help?', 'Não tenho ficheiro 3D — ainda me podem ajudar?'],
  ['Quote request received!', 'Pedido de orçamento recebido!'],
  ['We will inspect your CAD files, confirm printability, and send you the verified quote with an online payment link.', 'Vamos analisar o seu ficheiro CAD, confirmar a imprimibilidade e enviar-lhe o orçamento final com link de pagamento seguro.'],
  ['Done', 'Concluir'],
  ['Track Order →', 'Seguir Pedido →']
];

class LayerStudiosI18n {
  constructor() {
    this.currentLang = localStorage.getItem('ls_lang') || 'pt';
    window.LayerStudiosI18nInstance = this;
    this.init();
  }

  init() {
    this.renderLanguageSwitcherInNav();
    this.checkFirstVisitModal();
    this.applyLanguage(this.currentLang);
  }

  setLanguage(lang) {
    const prevLang = this.currentLang;
    if (lang !== 'pt' && lang !== 'en') lang = 'pt';
    this.currentLang = lang;
    localStorage.setItem('ls_lang', lang);
    localStorage.setItem('ls_lang_chosen', 'true');
    this.applyLanguage(lang);
    this.updateSwitcherUI();

    if (prevLang !== lang && window.LayerStudiosAnalytics) {
      window.LayerStudiosAnalytics.trackLanguageChanged(prevLang, lang);
    }
  }

  applyLanguage(lang) {
    document.documentElement.lang = lang;
    const isPT = (lang === 'pt');

    // Build phrase lookup map
    const phraseMap = new Map();
    LS_PHRASES.forEach(([en, pt]) => {
      const cleanEn = en.trim().replace(/\s+/g, ' ');
      const cleanPt = pt.trim().replace(/\s+/g, ' ');
      if (isPT) {
        phraseMap.set(cleanEn.toLowerCase(), cleanPt);
      } else {
        phraseMap.set(cleanPt.toLowerCase(), cleanEn);
      }
    });

    // Deep text node translation across the document
    const walkTextNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue.trim().replace(/\s+/g, ' ');
        if (text.length > 0) {
          const lower = text.toLowerCase();
          if (phraseMap.has(lower)) {
            node.nodeValue = phraseMap.get(lower);
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip script and style tags and the switcher button itself
        if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.classList.contains('lang-switcher-btn')) return;

        // Translate option text in selects
        if (node.tagName === 'OPTION') {
          const optText = node.textContent.trim().replace(/\s+/g, ' ').toLowerCase();
          if (phraseMap.has(optText)) {
            node.textContent = phraseMap.get(optText);
          }
        }

        // Translate placeholders
        if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
          if (node.placeholder) {
            const plower = node.placeholder.trim().replace(/\s+/g, ' ').toLowerCase();
            if (phraseMap.has(plower)) {
              node.placeholder = phraseMap.get(plower);
            }
          }
        }

        node.childNodes.forEach(child => walkTextNodes(child));
      }
    };

    walkTextNodes(document.body);
  }

  renderLanguageSwitcherInNav() {
    // Bind to all static or dynamic language buttons
    document.querySelectorAll('.lang-toggle-btn, .lang-switcher-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const nextLang = this.currentLang === 'pt' ? 'en' : 'pt';
        this.setLanguage(nextLang);
        if (window.LayerStudiosAnalytics) {
          window.LayerStudiosAnalytics.track('lang_changed', { lang: nextLang });
        }
        location.reload();
      };
    });

    this.updateSwitcherUI();
  }

  getSwitcherHTML() {
    return this.currentLang === 'pt' 
      ? '<span class="text-blue-400 font-bold">PT</span><span class="text-slate-600 mx-1">|</span><span class="text-slate-400">EN</span>'
      : '<span class="text-slate-400">PT</span><span class="text-slate-600 mx-1">|</span><span class="text-blue-400 font-bold">EN</span>';
  }

  updateSwitcherUI() {
    document.querySelectorAll('.lang-toggle-btn, .lang-switcher-btn').forEach(btn => {
      btn.innerHTML = this.getSwitcherHTML();
    });
  }

  checkFirstVisitModal() {
    const hasChosen = localStorage.getItem('ls_lang_chosen');
    if (hasChosen) return;

    // Show Language Selection Modal on first entry
    const modal = document.createElement('div');
    modal.id = 'lang-selection-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in';
    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
        <div class="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-2xl">
          🌍
        </div>
        
        <div>
          <h3 class="text-xl font-black text-white">Bem-vindo à Layer Studios</h3>
          <p class="text-xs text-slate-400 mt-1">Escolha o seu idioma / Select your preferred language</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <button type="button" id="btn-lang-choose-pt" class="p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 border-blue-500 bg-blue-500/10">
            <span class="text-3xl">🇵🇹</span>
            <span class="text-sm font-bold text-white">Português</span>
            <span class="text-[10px] text-slate-400 font-mono">Portugal & UE</span>
          </button>

          <button type="button" id="btn-lang-choose-en" class="p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 border-slate-800 bg-slate-950/60 hover:border-slate-700">
            <span class="text-3xl">🇬🇧</span>
            <span class="text-sm font-bold text-white">English</span>
            <span class="text-[10px] text-slate-400 font-mono">International</span>
          </button>
        </div>

        <button type="button" id="btn-lang-continue" class="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all">
          Continuar / Continue →
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    let selected = 'pt';

    modal.querySelector('#btn-lang-choose-pt').onclick = () => {
      selected = 'pt';
      modal.querySelector('#btn-lang-choose-pt').className = 'p-4 rounded-2xl border-2 border-blue-500 bg-blue-500/10 transition-all flex flex-col items-center gap-2';
      modal.querySelector('#btn-lang-choose-en').className = 'p-4 rounded-2xl border-2 border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-all flex flex-col items-center gap-2';
    };

    modal.querySelector('#btn-lang-choose-en').onclick = () => {
      selected = 'en';
      modal.querySelector('#btn-lang-choose-en').className = 'p-4 rounded-2xl border-2 border-blue-500 bg-blue-500/10 transition-all flex flex-col items-center gap-2';
      modal.querySelector('#btn-lang-choose-pt').className = 'p-4 rounded-2xl border-2 border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-all flex flex-col items-center gap-2';
    };

    modal.querySelector('#btn-lang-continue').onclick = () => {
      this.setLanguage(selected);
      modal.style.opacity = '0';
      modal.style.transition = 'opacity 0.25s ease';
      setTimeout(() => modal.remove(), 250);
    };
  }
}

// Global Theme & I18n Initialization (Default Theme = Dark / Preto)
if (typeof window !== 'undefined') {
  try {
    const savedTheme = localStorage.getItem('ls_theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  } catch (e) {}

  window.addEventListener('DOMContentLoaded', () => {
    window.LayerStudiosI18n = new LayerStudiosI18n();

    // Inject Theme Toggle Button (Dark default / Light option) into navbar
    const langBtn = document.getElementById('lang-toggle-btn') || document.querySelector('.lang-toggle-btn');
    if (langBtn && langBtn.parentElement && !document.getElementById('theme-toggle-btn')) {
      const themeBtn = document.createElement('button');
      themeBtn.id = 'theme-toggle-btn';
      themeBtn.type = 'button';
      themeBtn.className = 'inline-flex items-center space-x-1 px-2.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors';
      themeBtn.title = 'Alternar Tema Escuro / Claro';

      const updateBtnUI = () => {
        const isLight = document.documentElement.classList.contains('theme-light');
        themeBtn.innerHTML = isLight
          ? '<span>☀️</span><span class="hidden sm:inline text-[11px]">Claro</span>'
          : '<span>🌙</span><span class="hidden sm:inline text-[11px]">Escuro</span>';
      };
      updateBtnUI();

      themeBtn.addEventListener('click', () => {
        const isLight = document.documentElement.classList.toggle('theme-light');
        try {
          localStorage.setItem('ls_theme', isLight ? 'light' : 'dark');
        } catch (e) {}
        updateBtnUI();
        window.dispatchEvent(new CustomEvent('ls-theme-change', { detail: { theme: isLight ? 'light' : 'dark' } }));
      });

      langBtn.parentElement.insertBefore(themeBtn, langBtn);
    }

    // Smooth Page Transition Controller (Top Progress Bar + View Transitions + Prefetch)
    let topBar = document.getElementById('ls-top-progress');
    if (!topBar) {
      topBar = document.createElement('div');
      topBar.id = 'ls-top-progress';
      document.body.appendChild(topBar);
    }

    // Complete top progress bar on arrival
    try {
      if (sessionStorage.getItem('ls_nav_active') === '1') {
        sessionStorage.removeItem('ls_nav_active');
        topBar.style.transition = 'none';
        topBar.style.width = '85%';
        topBar.style.opacity = '1';
        void topBar.offsetWidth;
        topBar.style.transition = '';
        topBar.classList.add('is-done');
        setTimeout(() => {
          topBar.classList.remove('is-active', 'is-done');
          topBar.style.width = '0%';
        }, 400);
      }
    } catch (e) {}

    window.addEventListener('pageshow', (evt) => {
      if (evt.persisted) {
        document.body.classList.remove('ls-page-leaving');
        if (topBar) topBar.classList.remove('is-active', 'is-done');
      }
    });

    // Prefetch internal pages on hover for instant navigation
    const prefetched = new Set();
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      try {
        const u = new URL(link.href, window.location.origin);
        if (u.origin === window.location.origin && u.pathname !== window.location.pathname && !prefetched.has(u.pathname)) {
          prefetched.add(u.pathname);
          const pf = document.createElement('link');
          pf.rel = 'prefetch';
          pf.href = u.href;
          document.head.appendChild(pf);
        }
      } catch (err) {}
    }, { passive: true });

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;

      const rawHref = link.getAttribute('href') || '';
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || rawHref.startsWith('javascript:')) return;

      let targetUrl;
      try {
        targetUrl = new URL(link.href, window.location.origin);
      } catch (err) {
        return;
      }

      if (targetUrl.origin !== window.location.origin) return;
      if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) return;

      try {
        sessionStorage.setItem('ls_nav_active', '1');
      } catch (err) {}

      topBar.classList.remove('is-done');
      topBar.classList.add('is-active');

      // If browser supports native cross-document View Transitions, navigate immediately so GPU morphs the 3D card & page seamlessly
      if ('CSSViewTransitionRule' in window || CSS.supports('view-transition-name: studio-3d-slicer')) {
        return;
      }

      e.preventDefault();
      document.body.classList.add('ls-page-leaving');
      setTimeout(() => {
        window.location.href = targetUrl.href;
      }, 140);
    });

    // Mount Floating Support Chatbox on all customer pages (exclude /admin)
    if (!window.location.pathname.toLowerCase().startsWith('/admin')) {
      window.LayerStudiosChat = new LayerStudiosSupportChat();
    }
  });
}

class LayerStudiosSupportChat {
  constructor() {
    this.isOpen = false;
    this.isPt = (localStorage.getItem('ls_lang') || 'pt') === 'pt';
    this.mount();
  }

  mount() {
    if (document.getElementById('ls-chat-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'ls-chat-widget';

    const t = this.isPt ? {
      btnLabel: 'Suporte 3D',
      title: 'Apoio Técnico Layer Studios',
      status: 'Online · Resposta Imediata',
      welcome: 'Olá! 👋 Bem-vindo à <strong>Layer Studios</strong>. Como podemos ajudar com a sua impressão 3D ou encomenda hoje?',
      chipTrack: '📦 Seguir Encomenda',
      chipMat: '🧪 Qual material escolher?',
      chipCad: '📐 Formatos 3D & CAD',
      chipPrice: '💶 Preços & Descontos',
      chipHuman: '✉️ Falar com Engenheiro',
      placeholder: 'Escreva a sua dúvida ou código LS-...',
      sendBtn: 'Enviar',
      waLabel: 'WhatsApp',
      ticketTitle: 'Enviar Mensagem à Equipa Técnica',
      ticketName: 'O seu nome',
      ticketEmail: 'O seu email para resposta',
      ticketMsg: 'Descreva a sua dúvida, peça ou projeto...',
      ticketSubmit: 'Enviar Pedido de Suporte →',
      ticketCancel: 'Cancelar'
    } : {
      btnLabel: '3D Support',
      title: 'Layer Studios Tech Support',
      status: 'Online · Instant Reply',
      welcome: 'Hello! 👋 Welcome to <strong>Layer Studios</strong>. How can we help with your 3D print or order today?',
      chipTrack: '📦 Track Order',
      chipMat: '🧪 Best Material?',
      chipCad: '📐 3D Formats & CAD',
      chipPrice: '💶 Pricing & Discounts',
      chipHuman: '✉️ Message Engineer',
      placeholder: 'Ask a question or type LS-...',
      sendBtn: 'Send',
      waLabel: 'WhatsApp',
      ticketTitle: 'Send Message to Engineering Team',
      ticketName: 'Your name',
      ticketEmail: 'Your email for reply',
      ticketMsg: 'Describe your question, part, or project...',
      ticketSubmit: 'Send Support Request →',
      ticketCancel: 'Cancel'
    };

    widget.innerHTML = `
      <!-- Chat Window -->
      <div id="ls-chat-panel" class="chat-closed mb-3 w-[345px] sm:w-[385px] rounded-3xl bg-slate-900/95 border border-slate-700/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col max-h-[78vh]">
        
        <!-- Header -->
        <div class="px-4 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <div class="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
              LS
              <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950"></span>
            </div>
            <div>
              <h4 class="text-xs font-extrabold text-white leading-tight">${t.title}</h4>
              <p class="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>${t.status}</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <a href="https://wa.me/351962118770?text=Ol%C3%A1%20Layer%20Studios!%20Preciso%20de%20ajuda%20com%20uma%20impress%C3%A3o%203D." target="_blank" rel="noopener" class="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 text-[10px] font-bold transition-colors flex items-center gap-1" title="Abrir WhatsApp Direto (+351 962 118 770)">
              <span>💬</span><span>${t.waLabel}</span>
            </a>
            <button type="button" id="ls-chat-close" class="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" aria-label="Fechar">
              ✕
            </button>
          </div>
        </div>

        <!-- Scrollable Messages Container -->
        <div id="ls-chat-messages" class="p-4 overflow-y-auto space-y-3 text-xs max-h-[330px] min-h-[250px]">
          <div class="ls-chat-bot-bubble p-3.5 rounded-2xl rounded-tl-sm bg-slate-800/90 border border-slate-700/80 text-slate-200 leading-relaxed">
            ${t.welcome}
          </div>

          <!-- Quick Action Chips -->
          <div id="ls-chat-chips" class="flex flex-wrap gap-1.5 pt-1">
            <button type="button" data-chip="track" class="ls-chat-chip px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-slate-700 hover:border-blue-500/40 text-[11px] font-semibold transition-all">${t.chipTrack}</button>
            <button type="button" data-chip="materials" class="ls-chat-chip px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-slate-700 hover:border-blue-500/40 text-[11px] font-semibold transition-all">${t.chipMat}</button>
            <button type="button" data-chip="cad" class="ls-chat-chip px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-slate-700 hover:border-blue-500/40 text-[11px] font-semibold transition-all">${t.chipCad}</button>
            <button type="button" data-chip="pricing" class="ls-chat-chip px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 border border-slate-700 hover:border-blue-500/40 text-[11px] font-semibold transition-all">${t.chipPrice}</button>
            <button type="button" data-chip="human" class="ls-chat-chip px-2.5 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/30 text-[11px] font-bold transition-all">${t.chipHuman}</button>
          </div>
        </div>

        <!-- Inline Ticket Form (Hidden by default) -->
        <form id="ls-chat-ticket-form" class="hidden p-4 bg-slate-950/95 border-t border-slate-800 space-y-2.5 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-blue-400 text-[11px] uppercase tracking-wider">${t.ticketTitle}</span>
            <button type="button" id="ls-chat-ticket-cancel" class="text-[11px] text-slate-400 hover:text-white">${t.ticketCancel}</button>
          </div>
          <input type="text" id="ls-ticket-name" required placeholder="${t.ticketName}" class="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none">
          <input type="email" id="ls-ticket-email" required placeholder="${t.ticketEmail}" class="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none">
          <textarea id="ls-ticket-msg" required rows="2" placeholder="${t.ticketMsg}" class="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none resize-none"></textarea>
          <button type="submit" id="ls-ticket-submit" class="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all">
            ${t.ticketSubmit}
          </button>
        </form>

        <!-- Bottom Input Bar -->
        <form id="ls-chat-input-form" class="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input type="text" id="ls-chat-input" autocomplete="off" placeholder="${t.placeholder}" class="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none">
          <button type="submit" class="px-3.5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all shrink-0">
            ${t.sendBtn}
          </button>
        </form>

      </div>

      <!-- Floating Launcher Button -->
      <div class="flex justify-end">
        <button type="button" id="ls-chat-launcher" class="group flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all transform hover:-translate-y-0.5">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
          <span>${t.btnLabel}</span>
        </button>
      </div>
    `;

    document.body.appendChild(widget);

    // Pre-fill logged-in user info in ticket form
    try {
      const user = JSON.parse(localStorage.getItem('ls_user') || 'null');
      if (user) {
        if (user.name) document.getElementById('ls-ticket-name').value = user.name;
        if (user.email) document.getElementById('ls-ticket-email').value = user.email;
      }
    } catch (e) {}

    this.bindEvents();
  }

  bindEvents() {
    const launcher = document.getElementById('ls-chat-launcher');
    const closeBtn = document.getElementById('ls-chat-close');
    const panel = document.getElementById('ls-chat-panel');
    const inputForm = document.getElementById('ls-chat-input-form');
    const inputEl = document.getElementById('ls-chat-input');
    const ticketForm = document.getElementById('ls-chat-ticket-form');
    const ticketCancel = document.getElementById('ls-chat-ticket-cancel');

    const toggle = (openState) => {
      this.isOpen = typeof openState === 'boolean' ? openState : !this.isOpen;
      if (this.isOpen) {
        panel.classList.remove('chat-closed');
        panel.classList.add('chat-open');
        setTimeout(() => inputEl?.focus(), 150);
      } else {
        panel.classList.remove('chat-open');
        panel.classList.add('chat-closed');
      }
    };

    launcher?.addEventListener('click', () => toggle());
    closeBtn?.addEventListener('click', () => toggle(false));

    document.querySelectorAll('.ls-chat-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const chip = btn.getAttribute('data-chip');
        this.handleChip(chip, btn.textContent);
      });
    });

    ticketCancel?.addEventListener('click', () => {
      ticketForm.classList.add('hidden');
      inputForm.classList.remove('hidden');
    });

    ticketForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('ls-ticket-name').value.trim();
      const email = document.getElementById('ls-ticket-email').value.trim();
      const message = document.getElementById('ls-ticket-msg').value.trim();
      const submitBtn = document.getElementById('ls-ticket-submit');
      if (!email || !message) return;

      submitBtn.disabled = true;
      submitBtn.textContent = this.isPt ? 'A enviar...' : 'Sending...';

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name || 'Cliente Chatbox',
            email,
            subject: 'Pedido de Suporte via Chatbox',
            message
          })
        });
        const data = await res.json();
        ticketForm.classList.add('hidden');
        inputForm.classList.remove('hidden');
        document.getElementById('ls-ticket-msg').value = '';
        this.appendUserMessage(message);
        if (res.ok && data.success) {
          this.appendBotMessage(
            this.isPt
              ? `✅ <strong>Mensagem enviada para a nossa equipa técnica!</strong><br>Enviámos também confirmação para <code>${email}</code>. Responderemos muito em breve (ou fale connosco já no <a href="https://wa.me/351962118770" target="_blank" class="text-emerald-400 underline font-bold">WhatsApp ↗</a>).`
              : `✅ <strong>Message sent to our engineering team!</strong><br>We also sent a confirmation to <code>${email}</code>. We will reply shortly.`
          );
        } else {
          throw new Error('Request failed');
        }
      } catch (err) {
        this.appendBotMessage(
          this.isPt
            ? `⚠️ Não foi possível enviar automaticamente. Por favor contacte-nos diretamente em <a href="mailto:contact@layerstudios.pt" class="text-blue-400 underline">contact@layerstudios.pt</a> ou no <a href="https://wa.me/351962118770" target="_blank" class="text-emerald-400 underline font-bold">WhatsApp (+351 962 118 770)</a>.`
            : `⚠️ Could not send automatically. Please email <a href="mailto:contact@layerstudios.pt" class="text-blue-400 underline">contact@layerstudios.pt</a> or message us on WhatsApp.`
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = this.isPt ? 'Enviar Pedido de Suporte →' : 'Send Support Request →';
      }
    });

    inputForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = '';
      this.appendUserMessage(text);
      this.processUserText(text);
    });
  }

  smoothScrollToBottom() {
    const container = document.getElementById('ls-chat-messages');
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    });
  }

  appendUserMessage(text) {
    if (!text) return;
    const container = document.getElementById('ls-chat-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'flex justify-end ls-msg-user-enter';
    const bubble = document.createElement('div');
    bubble.className = 'px-3.5 py-2.5 rounded-2xl rounded-br-sm bg-blue-500 text-white max-w-[85%] leading-relaxed shadow-md shadow-blue-500/15';
    bubble.textContent = text;
    div.appendChild(bubble);
    container.appendChild(div);
    this.smoothScrollToBottom();
  }

  appendBotMessage(html) {
    const container = document.getElementById('ls-chat-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'ls-chat-bot-bubble ls-msg-bot-enter p-3.5 rounded-2xl rounded-bl-sm bg-slate-800/90 border border-slate-700/80 text-slate-200 leading-relaxed space-y-1.5 shadow-sm';
    div.innerHTML = html;
    container.appendChild(div);
    this.smoothScrollToBottom();
  }

  showTypingIndicator() {
    const container = document.getElementById('ls-chat-messages');
    if (!container) return null;
    this.removeTypingIndicator();
    const div = document.createElement('div');
    div.id = 'ls-chat-typing-bubble';
    div.className = 'ls-chat-bot-bubble ls-msg-bot-enter px-3.5 py-3 rounded-2xl rounded-bl-sm bg-slate-800/90 border border-slate-700/80 w-fit shadow-sm';
    div.innerHTML = '<div class="ls-typing-dots"><span></span><span></span><span></span></div>';
    container.appendChild(div);
    this.smoothScrollToBottom();
    return div;
  }

  removeTypingIndicator() {
    const existing = document.getElementById('ls-chat-typing-bubble');
    if (existing) existing.remove();
  }

  replyWithTyping(html, delayMs = 540, afterCallback = null) {
    setTimeout(() => {
      this.showTypingIndicator();
      setTimeout(() => {
        this.removeTypingIndicator();
        this.appendBotMessage(html);
        if (typeof afterCallback === 'function') afterCallback();
      }, delayMs);
    }, 150);
  }

  openTicketForm(prefillText = '') {
    const ticketForm = document.getElementById('ls-chat-ticket-form');
    const inputForm = document.getElementById('ls-chat-input-form');
    if (ticketForm && inputForm) {
      inputForm.classList.add('hidden');
      ticketForm.classList.remove('hidden');
      if (prefillText) {
        document.getElementById('ls-ticket-msg').value = prefillText;
      }
      setTimeout(() => document.getElementById('ls-ticket-email')?.focus(), 180);
    }
  }

  handleChip(chip, label) {
    if (chip === 'human') {
      if (label) this.appendUserMessage(label);
      this.replyWithTyping(
        this.isPt
          ? `👨‍🔧 Claro! Preencha o seu email e a sua questão aqui em baixo — a nossa equipa técnica responde diretamente para o seu email:`
          : `👨‍🔧 Of course! Fill in your email and question below — our engineering team will reply directly to your inbox:`,
        420,
        () => this.openTicketForm()
      );
      return;
    }
    if (label) this.appendUserMessage(label);
    if (chip === 'track') {
      this.replyWithTyping(
        this.isPt
          ? `📦 Escreva aqui em baixo o seu código de referência (ex: <code>LS-...</code>) e eu consulto o estado em direto!<br><span class="text-[11px] text-slate-400">Ou abra a página <a href="/track" class="text-blue-400 underline font-semibold">Seguir Encomenda →</a></span>`
          : `📦 Type your order or quote reference below (e.g. <code>LS-...</code>) and I'll look up its live status!`
      );
    } else if (chip === 'materials') {
      this.replyWithTyping(
        this.isPt
          ? `🧪 <strong>Guia Rápido de Materiais:</strong><br>
             • <strong>PLA+:</strong> Económico, acabamento super nítido, ideal para protótipos visuais.<br>
             • <strong>PETG:</strong> Forte, resistente ao sol/água e até 75°C (o mais versátil!).<br>
             • <strong>ABS / ASA:</strong> Alta temperatura (100°C) e uso exterior severo.<br>
             • <strong>TPU 95A:</strong> Flexível tipo borracha, absorve impactos.<br>
             • <strong>CF-Nylon:</strong> Compósito com fibra de carbono para máxima rigidez mecânica.<br>
             <a href="/materials" class="inline-block mt-1 text-blue-400 underline font-semibold">Ver tabela comparativa completa →</a>`
          : `🧪 <strong>Material Quick Guide:</strong><br>• <strong>PLA+:</strong> Crisp detail & economical.<br>• <strong>PETG:</strong> Tough, weather & heat resistant (up to 75°C).<br>• <strong>ABS/ASA:</strong> High temp (100°C) & UV stable.<br>• <strong>TPU 95A:</strong> Flexible & shock-absorbing.<br>• <strong>CF-Nylon:</strong> Carbon-fiber reinforced strength.`
      );
    } else if (chip === 'cad') {
      this.replyWithTyping(
        this.isPt
          ? `📐 <strong>Formatos 3D & Desenho CAD:</strong><br>
             • No nosso <a href="/quote" class="text-blue-400 underline font-semibold">Slicer 3D Online</a> pode carregar <code>.STL</code>, <code>.3MF</code> e <code>.OBJ</code> com cálculo automático de volume e separação de peças.<br>
             • Também aceitamos <code>.STEP</code> e desenhos <code>.PDF</code>.<br>
             • <strong>Não tem ficheiro 3D?</strong> Escolha a aba <em>"Preciso de desenho CAD"</em> em <a href="/quote" class="text-blue-400 underline font-semibold">Pedir Orçamento</a> e envie-nos uma foto ou esboço com medidas!`
          : `📐 <strong>3D Formats & CAD Service:</strong><br>Upload <code>.STL</code>, <code>.3MF</code>, <code>.OBJ</code>, or <code>.STEP</code> in our <a href="/quote" class="text-blue-400 underline font-semibold">Instant 3D Slicer</a>. Need CAD modeling? Select <em>"I need it designed"</em> on the Quote page!`
      );
    } else if (chip === 'pricing') {
      this.replyWithTyping(
        this.isPt
          ? `💶 <strong>Preços, Descontos de Lote e Envios:</strong><br>
             • O preço é calculado na hora em <a href="/quote" class="text-blue-400 underline font-semibold">Pedir Orçamento</a> conforme o volume (cm³), material e infill.<br>
             • <strong>Descontos automáticos de quantidade:</strong> 5+ un (-10%), 10+ un (-15%), 25+ un (-22%), 50+ un (-30%).<br>
             • <strong>Envio Registado Portugal:</strong> €4.50 (<strong>Grátis</strong> em encomendas ≥ €50!).<br>
             • Pagamento seguro via <strong>MB WAY, Multibanco, Cartão, Apple Pay e Google Pay</strong>.`
          : `💶 <strong>Pricing & Batch Discounts:</strong><br>Instant calculation at <a href="/quote" class="text-blue-400 underline font-semibold">Get a Quote</a>. Automatic volume discounts: 5+ (-10%), 10+ (-15%), 25+ (-22%), 50+ (-30%). Free shipping in Portugal over €50!`
      );
    }
  }

  async processUserText(text) {
    const upper = text.toUpperCase();
    // 1. Check if text contains an order/quote reference like LS-...
    const refMatch = upper.match(/\b(LS-[A-Z0-9-]+)\b/);
    if (refMatch) {
      const refId = refMatch[1];
      this.showTypingIndicator();
      try {
        const [res] = await Promise.all([
          fetch(`/api/track/${encodeURIComponent(refId)}`),
          new Promise(r => setTimeout(r, 480))
        ]);
        const payload = await res.json();
        this.removeTypingIndicator();
        if (res.ok && payload && payload.data) {
          const d = payload.data;
          const isPaid = String(d.paymentStatus || '').toLowerCase() === 'paid';
          const trackingHtml = d.trackingNumber
            ? `<div class="mt-1 text-emerald-400">🚚 Tracking (${d.carrier || 'CTT'}): <strong>${d.trackingNumber}</strong></div>`
            : '';
          this.appendBotMessage(`
            <div class="space-y-1">
              <div class="font-bold text-white flex items-center justify-between">
                <span>📦 ${d.id}</span>
                <span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">${d.status || 'Em análise'}</span>
              </div>
              <div class="text-[11px] text-slate-300 font-mono">
                Valor: <strong>€${Number(d.total || 0).toFixed(2)}</strong> · Pagamento: <strong class="${isPaid ? 'text-emerald-400' : 'text-amber-400'}">${isPaid ? 'Pago ✓' : 'Pendente'}</strong>
              </div>
              ${trackingHtml}
              <div class="pt-1.5">
                <a href="/track?id=${encodeURIComponent(d.id)}" class="inline-block px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-bold text-[11px]">Abrir Detalhes & Pagamento →</a>
              </div>
            </div>
          `);
          return;
        } else {
          this.appendBotMessage(
            this.isPt
              ? `Não encontrei nenhum pedido com a referência <code>${refId}</code>. Verifique o código no seu email ou consulte em <a href="/track" class="text-blue-400 underline">Seguir Encomenda</a>.`
              : `No order or quote found with reference <code>${refId}</code>. Please check your confirmation email or visit <a href="/track" class="text-blue-400 underline">Track Order</a>.`
          );
          return;
        }
      } catch (e) {
        this.removeTypingIndicator();
      }
    }

    const lower = text.toLowerCase();
    if (lower.includes('material') || lower.includes('pla') || lower.includes('petg') || lower.includes('tpu') || lower.includes('abs') || lower.includes('asa') || lower.includes('carbon')) {
      this.handleChip('materials', '');
      return;
    }
    if (lower.includes('preço') || lower.includes('preco') || lower.includes('custo') || lower.includes('orçamento') || lower.includes('orcamento') || lower.includes('desconto') || lower.includes('quanto custa')) {
      this.handleChip('pricing', '');
      return;
    }
    if (lower.includes('stl') || lower.includes('3mf') || lower.includes('step') || lower.includes('cad') || lower.includes('ficheiro') || lower.includes('desenho')) {
      this.handleChip('cad', '');
      return;
    }
    if (lower.includes('envio') || lower.includes('porte') || lower.includes('ctt') || lower.includes('prazo') || lower.includes('entrega')) {
      this.replyWithTyping(
        this.isPt
          ? `🚚 <strong>Envios e Prazos:</strong><br>• <strong>Portugal Continental:</strong> €4.50 (Grátis ≥ €50) · 24–48h úteis via CTT Expresso.<br>• <strong>Ilhas:</strong> €6.90 · <strong>União Europeia:</strong> €9.90.<br>• Produção padrão em 2–4 dias úteis (ou Urgente 24–48h).`
          : `🚚 <strong>Shipping & Lead Times:</strong><br>Portugal Mainland €4.50 (Free ≥ €50, 24–48h CTT). Islands €6.90, EU €9.90. Standard production takes 2–4 business days.`
      );
      return;
    }

    // Default: offer to send their exact message directly to the engineering team or WhatsApp
    this.replyWithTyping(
      this.isPt
        ? `Posso encaminhar já a sua mensagem <em>"${text.replace(/</g, '&lt;')}"</em> diretamente para o nosso engenheiro responder por email, ou pode falar connosco no WhatsApp:`
        : `I can forward your message directly to our engineer for a fast email reply, or you can message us on WhatsApp:`,
      480,
      () => this.openTicketForm(text)
    );
  }
}
