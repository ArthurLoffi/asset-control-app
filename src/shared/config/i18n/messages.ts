// Application-authored messages remain stable in models; localize when displayed.
export const messageTranslations = {
    invalidCredentials: [
        'invalid username or password',
        'Usuário ou senha inválidos',
    ],
    authenticationRequired: [
        'authentication required',
        'É necessário entrar na sua conta',
    ],
    sessionExpired: ['session expired', 'Sua sessão expirou'],
    logoutFailure: ['unable to sign out', 'Não foi possível sair'],
    serviceUnavailable: ['service unavailable', 'Serviço indisponível'],
    network: [
        'Unable to connect to the server. Please try again.',
        'Não foi possível conectar ao servidor. Tente novamente.',
    ],
    deactivate: [
        'Unable to deactivate record.',
        'Não foi possível desativar o registro.',
    ],
    loadOrganizations: [
        'Unable to load organization options.',
        'Não foi possível carregar as opções de filial e departamento.',
    ],
    loadDashboard: [
        'Unable to load the dashboard.',
        'Não foi possível carregar o painel.',
    ],
    session: [
        'Unable to check your session.',
        'Não foi possível verificar sua sessão.',
    ],
    credentials: [
        'Enter your username and password.',
        'Digite seu usuário e senha.',
    ],
    signIn: ['Unable to sign in.', 'Não foi possível entrar.'],
    signOut: ['Unable to sign out.', 'Não foi possível sair.'],
    user: ['Enter a user.', 'Digite um usuário.'],
    email: [
        'Enter a valid email address.',
        'Digite um endereço de e-mail válido.',
    ],
    password: ['Enter a password.', 'Digite uma senha.'],
    employee: [
        'Enter a name and email, then select a branch and department.',
        'Digite um nome e e-mail, depois selecione uma filial e um departamento.',
    ],
    machineRequired: [
        'Complete all required machine fields.',
        'Preencha todos os campos obrigatórios do computador.',
    ],
    monitorRequired: [
        'Complete all required monitor fields.',
        'Preencha todos os campos obrigatórios do monitor.',
    ],
    phoneRequired: [
        'Complete all required phone fields.',
        'Preencha todos os campos obrigatórios do celular.',
    ],
    machineDetails: [
        'Select valid machine details.',
        'Selecione opções válidas para o computador.',
    ],
    monitorDetails: [
        'Select valid monitor details.',
        'Selecione opções válidas para o monitor.',
    ],
    phoneDetails: [
        'Select valid phone details.',
        'Selecione opções válidas para o celular.',
    ],
    ids: [
        'Asset and employee IDs must be positive whole numbers.',
        'O número do ativo e o ID do colaborador devem ser números inteiros positivos.',
    ],
    printerRequired: [
        'Enter a positive asset number and select a branch and department.',
        'Digite um número de ativo positivo e selecione uma filial e um departamento.',
    ],
    printerModel: [
        'Enter a model with 1 to 100 characters.',
        'Digite um modelo com 1 a 100 caracteres.',
    ],
    printerIp: [
        'Enter a valid IPv4 or IPv6 address.',
        'Digite um endereço IPv4 ou IPv6 válido.',
    ],
    printerCondition: [
        'Select a valid printer condition.',
        'Selecione uma condição válida para a impressora.',
    ],
    emailId: ['Enter an email ID.', 'Digite um ID de e-mail.'],
    emailUser: ['Enter a user to search.', 'Digite um usuário para buscar.'],
    positiveId: ['Enter a valid positive ID.', 'Digite um ID positivo válido.'],
    employeeId: [
        'Enter a valid positive employee ID.',
        'Digite um ID de colaborador positivo válido.',
    ],
    emailRange: [
        'Enter a whole-number ID from 1 to 2147483647.',
        'Digite um ID inteiro de 1 a 2147483647.',
    ],
    employeeLoad: [
        'Unable to load employees.',
        'Não foi possível carregar os colaboradores.',
    ],
    employeeSave: [
        'Unable to save employee.',
        'Não foi possível salvar colaborador.',
    ],
    employeecreated: [
        'Employee created successfully.',
        'Colaborador criado com sucesso.',
    ],
    employeeupdated: [
        'Employee updated successfully.',
        'Colaborador atualizado com sucesso.',
    ],
    employeedeactivated: [
        'Employee deactivated successfully.',
        'Colaborador desativado com sucesso.',
    ],
    machineLoad: [
        'Unable to load machines.',
        'Não foi possível carregar os computadores.',
    ],
    machineSave: [
        'Unable to save machine.',
        'Não foi possível salvar computador.',
    ],
    machinecreated: [
        'Machine created successfully.',
        'Computador criado com sucesso.',
    ],
    machineupdated: [
        'Machine updated successfully.',
        'Computador atualizado com sucesso.',
    ],
    machinedeactivated: [
        'Machine deactivated successfully.',
        'Computador desativado com sucesso.',
    ],
    monitorLoad: [
        'Unable to load monitors.',
        'Não foi possível carregar os monitores.',
    ],
    monitorSave: [
        'Unable to save monitor.',
        'Não foi possível salvar monitor.',
    ],
    monitorcreated: [
        'Monitor created successfully.',
        'Monitor criado com sucesso.',
    ],
    monitorupdated: [
        'Monitor updated successfully.',
        'Monitor atualizado com sucesso.',
    ],
    monitordeactivated: [
        'Monitor deactivated successfully.',
        'Monitor desativado com sucesso.',
    ],
    phoneLoad: [
        'Unable to load phones.',
        'Não foi possível carregar os celulares.',
    ],
    phoneSave: ['Unable to save phone.', 'Não foi possível salvar celular.'],
    phonecreated: [
        'Phone created successfully.',
        'Celular criado com sucesso.',
    ],
    phoneupdated: [
        'Phone updated successfully.',
        'Celular atualizado com sucesso.',
    ],
    phonedeactivated: [
        'Phone deactivated successfully.',
        'Celular desativado com sucesso.',
    ],
    printerLoad: [
        'Unable to load printers.',
        'Não foi possível carregar as impressoras.',
    ],
    printerSave: [
        'Unable to save printer.',
        'Não foi possível salvar impressora.',
    ],
    printercreated: [
        'Printer created successfully.',
        'Impressora criada com sucesso.',
    ],
    printerupdated: [
        'Printer updated successfully.',
        'Impressora atualizada com sucesso.',
    ],
    printerdeactivated: [
        'Printer deactivated successfully.',
        'Impressora desativada com sucesso.',
    ],
    emailLoad: [
        'Unable to load emails.',
        'Não foi possível carregar os e-mails.',
    ],
    emailSave: ['Unable to save email.', 'Não foi possível salvar e-mail.'],
    emailcreated: ['Email created successfully.', 'E-mail criado com sucesso.'],
    emailupdated: [
        'Email updated successfully.',
        'E-mail atualizado com sucesso.',
    ],
    emaildeactivated: [
        'Email deactivated successfully.',
        'E-mail desativado com sucesso.',
    ],
} as const;
