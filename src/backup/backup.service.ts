import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as util from 'util';
import * as childProcess from 'child_process';
import * as archiver from 'archiver';
import * as jsonexport from 'jsonexport';
import * as ExcelJS from 'exceljs';

import { MailerService } from '@nestjs-modules/mailer';
import { AffectationService } from 'src/affectation/affectation.service';
import { AgenceService } from 'src/angence/agence.service';
import { AssignmentService } from 'src/assignment/assignment.service';
import { CaisseService } from 'src/caisse/caisse.service';
import { ChefsectionService } from 'src/chefsection/chefsection.service';
import { CongeService } from 'src/conge/conge.service';
import { EmployerService } from 'src/employer/employer.service';
import { EntrepotService } from 'src/entrepot/entrepot.service';
import { ExpensesService } from 'src/expenses/expenses.service';
import { ManagerService } from 'src/manager/manager.service';
import { MoisanneeService } from 'src/moisannee/moisannee.service';
import { MouvementstockService } from 'src/mouvementstock/mouvementstock.service';
import { MvtStockService } from 'src/mvt-stock/mvt-stock.service';
import { PatientService } from 'src/patient/patient.service';
import { PaysService } from 'src/pays/pays.service';
import { PayscaService } from 'src/paysca/paysca.service';
import { ProduitService } from 'src/produit/produit.service';
import { ProduitendommageService } from 'src/produitendommage/produitendommage.service';
import { RoleService } from 'src/role/role.service';
import { SalaireService } from 'src/salaire/salaire.service';
import { SalaireManagerService } from 'src/salaire_manager/salaire_manager.service';
import { SectionService } from 'src/section/section.service';
import { StockPaysService } from 'src/stock-pays/stock-pays.service';
import { StockService } from 'src/stock/stock.service';
import { StockagenceService } from 'src/stockagence/stockagence.service';
import { SuperviseurzoneService } from 'src/superviseurzone/superviseurzone.service';
import { TauxService } from 'src/taux/taux.service';
import { TauxzoneService } from 'src/tauxzone/tauxzone.service';
import { UserService } from 'src/user/user.service';
import { WeekendyService } from 'src/weekendy/weekendy.service';
import { ZoneService } from 'src/zone/zone.service';
import { MailService } from './mail.service';
import path from 'path';

const exec = util.promisify(childProcess.exec);
const execAsync = util.promisify(exec);

@Injectable()
export class BackupService {
  private mongoUri =
    'mongodb://mongo:IrtUOYAJdNRxLggDUVSRQOQOmLPQFvCF@shuttle.proxy.rlwy.net:53391/tswDB?authSource=admin';

  constructor(
    private readonly mailerService: MailerService,
    private readonly mailService: MailService,
    private weekendyservice: WeekendyService,
    private managerservice: ManagerService,
    private produitService: ProduitService,
    private agenceservice: AgenceService,
    private zoneservice: ZoneService,
    private sectionservice: SectionService,
    private tauxzoneservice: TauxzoneService,
    private tauxservice: TauxService,
    private payscaservice: PayscaService,
    private stockagenceService: StockagenceService,
    private affectationservice: AffectationService,
    private salaireService: SalaireService,
    private salairemanagerService: SalaireManagerService,
    private chefsectionService: ChefsectionService,
    private assignmentService: AssignmentService,
    private caisseService: CaisseService,
    private congesservice: CongeService,
    private employerservice: EmployerService,
    private entrepotservice: EntrepotService,
    private expenseservice: ExpensesService,
    private moisannesservice: MoisanneeService,
    private mouvementstockservice: MouvementstockService,
    private mvtStockService: MvtStockService,
    private patientService: PatientService,
    private paysService: PaysService,
    private produitendommageService: ProduitendommageService,
    private roleService: RoleService,
    private stockService: StockService,
    private stockPaysService: StockPaysService,
    private superviseurzoneService: SuperviseurzoneService,
    private userService: UserService,
  ) {}

  async processDataAndSendEmail() {
    // Récupérer les données de la base de données
    try {
    } catch (error) {
      console.error("Une erreur s'est produite:", error);
    }
  }

  private async writeJSONToFile(data: any[], fileName: string): Promise<void> {
    const jsonContent = await jsonexport(data);
    fs.writeFileSync(fileName, jsonContent);
  }

  private async createZipArchive(
    files: string[],
    zipFileName: string,
  ): Promise<void> {
    const output = fs.createWriteStream(zipFileName);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    files.forEach((file) => {
      archive.file(file, { name: file });
    });

    await archive.finalize();
  }

  private async creerZipArchive(
    jsonFileName: string,
    zipFileName: string,
  ): Promise<void> {
    const output = fs.createWriteStream(zipFileName);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    archive.file(jsonFileName, { name: 'collectionsData.json' });

    await archive.finalize();
  }

  private async writeExcelToFile(data: any[], fileName: string): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    // Ecrire les données dans le fichier Excel
    // Vous devrez adapter cela en fonction du format de vos données
    worksheet.addRows(data);
    await workbook.xlsx.writeFile(fileName);
  }

  async sendEmail(destination: string, subject: string, message: string) {
    await this.mailerService.sendMail({
      to: destination,
      subject: subject,
      text: message,
    });
  }

  async backupdata() {
    const contisation = await this.salairemanagerService.cotisationbackup();
    const contisationpaye =
      await this.salairemanagerService.cotisationpayebackup();
    const salairemanager =
      await this.salairemanagerService.salairemanagerbackup();
    const dettebureau = await this.salairemanagerService.dettebureaubackup();
    const remboursement =
      await this.salairemanagerService.remboursementbackup();
    const section = await this.sectionservice.sectionbackup();
    const chefsectionprime = await this.sectionservice.chefsectionprimebackup();
    const sectionca = await this.sectionservice.sectioncabackup();
    const sectioncamois = await this.sectionservice.sectioncamoisbackup();
    const stock = await this.stockService.stockbackup();
    const stockpay = await this.stockPaysService.stockpaybackup();
    const stockagence = await this.stockagenceService.stockagencebackup();
    const superviseurzone =
      await this.superviseurzoneService.superviserzonebackup();
    const taux = await this.tauxservice.tauxbackup();
    const tauxzone = await this.tauxzoneservice.tauzonebackup();
    const tauxsection = await this.tauxzoneservice.tausectionbackup();
    const users = await this.userService.userbackup();
    const weekendies = await this.weekendyservice.weekendybackup();
    const zones = await this.zoneservice.zonebackup();
    const salaire = await this.salaireService.salairebackup();
    const roles = await this.roleService.rolebackup();
    const produits = await this.produitService.productsbackup();
    const produitendommages =
      await this.produitendommageService.produitendommagesbackup();
    const produitendommagesvendus =
      await this.produitendommageService.produitendovendubackup();
    const produitendommagesstock =
      await this.produitendommageService.stockproduitendo();
    const patients = await this.patientService.patientbackup();
    const patientsdocteur = await this.patientService.patientdocteurbackup();
    const patientskine = await this.patientService.patientkinebackup();
    const caissekine = await this.patientService.caissekinebackup();
    const soldecaissekine = await this.patientService.caissekinesoldebackup();
    const caissemachine = await this.patientService.caissemachinebackup();
    const caissemachinesolde =
      await this.patientService.caissemachinesoldebackup();
    const caissecarnet = await this.patientService.caissecarnetbackup();
    const caissecarnetsolde =
      await this.patientService.caissecarnetsoldebackup();
    const demande = await this.patientService.demandebackup();
    const seance = await this.patientService.seancebackup();
    const pays = await this.paysService.paysbackup();
    const paysca = await this.payscaservice.findAllCabackup();
    const missions = await this.assignmentService.missionbackup();

    const mvtstockpaysentrepot = await this.mvtStockService.mvtstockbackup();

    const mouvementstockpaysbureau =
      await this.mouvementstockservice.mouvementstockbackup();
    const consignation = await this.mouvementstockservice.consignationbackup();
    const annee = await this.moisannesservice.anneebackup();
    const mois = await this.moisannesservice.moisbackup();
    const managers = await this.managerservice.managersbackup();
    const caisse = await this.caisseService.caissebackup();
    const expenses = await this.expenseservice.expensesbackup();
    const categories = await this.expenseservice.categoriesbackup();
    const entrepot = await this.entrepotservice.entrepotbackup();
    const chefsections = await this.chefsectionService.chefsectionbackup();
    const operationentrepot =
      await this.entrepotservice.operationentrepotbackup();
    const stockentrepot = await this.entrepotservice.entrepotstockbackup();
    const sortieentrepot = await this.entrepotservice.sortieentrepotbackup();
    const stockalertentrepot = await this.entrepotservice.stockalertbackup();
    const employer = await this.employerservice.employerbackup();
    const conges = await this.congesservice.congebackup();
    const agences = await this.agenceservice.bureaubackup();
    const affectations = await this.affectationservice.affectationbackup();
    // console.log(collectionNames.length)

    return {
      contisation,
      contisationpaye,
      salairemanager,
      dettebureau,
      remboursement,
      section,
      chefsectionprime,
      sectionca,
      sectioncamois,
      stock,
      stockpay,
      stockagence,
      superviseurzone,
      taux,
      tauxzone,
      tauxsection,
      users,
      weekendies,
      zones,
      salaire,
      roles,
      produits,
      produitendommages,
      produitendommagesvendus,
      produitendommagesstock,
      patients,
      patientsdocteur,
      patientskine,
      caissekine,
      soldecaissekine,
      caissemachine,
      caissemachinesolde,
      caissecarnet,
      caissecarnetsolde,
      demande,
      seance,
      pays,
      paysca,
      missions,
      mvtstockpaysentrepot,
      mouvementstockpaysbureau,
      consignation,
      annee,
      mois,
      managers,
      caisse,
      expenses,
      categories,
      entrepot,
      chefsections,
      operationentrepot,
      stockentrepot,
      sortieentrepot,
      stockalertentrepot,
      employer,
      conges,
      agences,
      affectations,
    };
  }

  async createBackup(): Promise<string> {
    const mongoUri = this.mongoUri;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables.');
    }
    // Vérifier que les éléments du chemin sont définis avant de les utiliser
    const dumpDir = path.join(__dirname, '..', '..', 'dumps');
    console.log('dumpDir:', dumpDir); // Vérifier la valeur de dumpDir
    if (!fs.existsSync(dumpDir)) {
      fs.mkdirSync(dumpDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(dumpDir, `mongo-backup-${timestamp}.gz`);
    console.log('outputPath:', outputPath); // Vérifier la valeur du chemin de sortie
    const command = `mongodump --uri="${mongoUri}" --archive="${outputPath}" --gzip`;
    try {
      await execAsync(command);
      return outputPath;
    } catch (error) {
      console.error('Erreur lors du mongodump:', error);
      throw new Error('Backup failed');
    }
  }
}
