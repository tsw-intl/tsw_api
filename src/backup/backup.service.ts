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
    const [
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
    ] = await Promise.all([
      this.salairemanagerService.cotisationbackup(),
      this.salairemanagerService.cotisationpayebackup(),
      this.salairemanagerService.salairemanagerbackup(),
      this.salairemanagerService.dettebureaubackup(),
      this.salairemanagerService.remboursementbackup(),
      this.sectionservice.sectionbackup(),
      this.sectionservice.chefsectionprimebackup(),
      this.sectionservice.sectioncabackup(),
      this.sectionservice.sectioncamoisbackup(),
      this.stockService.stockbackup(),
      this.stockPaysService.stockpaybackup(),
      this.stockagenceService.stockagencebackup(),
      this.superviseurzoneService.superviserzonebackup(),
      this.tauxservice.tauxbackup(),
      this.tauxzoneservice.tauzonebackup(),
      this.tauxzoneservice.tausectionbackup(),
      this.userService.userbackup(),
      this.weekendyservice.weekendybackup(),
      this.zoneservice.zonebackup(),
      this.salaireService.salairebackup(),
      this.roleService.rolebackup(),
      this.produitService.productsbackup(),
      this.produitendommageService.produitendommagesbackup(),
      this.produitendommageService.produitendovendubackup(),
      this.produitendommageService.stockproduitendo(),
      this.patientService.patientbackup(),
      this.patientService.patientdocteurbackup(),
      this.patientService.patientkinebackup(),
      this.patientService.caissekinebackup(),
      this.patientService.caissekinesoldebackup(),
      this.patientService.caissemachinebackup(),
      this.patientService.caissemachinesoldebackup(),
      this.patientService.caissecarnetbackup(),
      this.patientService.caissecarnetsoldebackup(),
      this.patientService.demandebackup(),
      this.patientService.seancebackup(),
      this.paysService.paysbackup(),
      this.payscaservice.findAllCabackup(),
      this.assignmentService.missionbackup(),
      this.mvtStockService.mvtstockbackup(),
      this.mouvementstockservice.mouvementstockbackup(),
      this.mouvementstockservice.consignationbackup(),
      this.moisannesservice.anneebackup(),
      this.moisannesservice.moisbackup(),
      this.managerservice.managersbackup(),
      this.caisseService.caissebackup(),
      this.expenseservice.expensesbackup(),
      this.expenseservice.categoriesbackup(),
      this.entrepotservice.entrepotbackup(),
      this.chefsectionService.chefsectionbackup(),
      this.entrepotservice.operationentrepotbackup(),
      this.entrepotservice.entrepotstockbackup(),
      this.entrepotservice.sortieentrepotbackup(),
      this.entrepotservice.stockalertbackup(),
      this.employerservice.employerbackup(),
      this.congesservice.congebackup(),
      this.agenceservice.bureaubackup(),
      this.affectationservice.affectationbackup(),
    ]);

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

    // Vérification de __dirname
    if (typeof __dirname === 'undefined') {
      console.error('__dirname is undefined');
      throw new Error('__dirname is undefined');
    }

    // Construction manuelle du répertoire dump
    const dumpDir = __dirname + '/../../dumps';
    console.log('dumpDir:', dumpDir); // Afficher le chemin pour vérifier sa validité

    if (!fs.existsSync(dumpDir)) {
      console.log(`Création du répertoire: ${dumpDir}`);
      fs.mkdirSync(dumpDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = dumpDir + '/mongo-backup-' + timestamp + '.gz';

    console.log('outputPath:', outputPath); // Afficher le chemin de sortie

    // Commande mongodump
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
