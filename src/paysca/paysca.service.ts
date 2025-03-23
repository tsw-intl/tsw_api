import { Injectable } from '@nestjs/common';
import { CreatePayscaDto } from './dto/create-paysca.dto';
import { UpdatePayscaDto } from './dto/update-paysca.dto';
import { Paysca, PayscaDocument } from './schemas/paysca.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  Document,
  HydratedDocument,
  Model,
  Types,
  UpdateQuery,
} from 'mongoose';
import { Payscayear, PayscayearDocument } from './schemas/payscayear.schema';
import { json } from 'stream/consumers';
import { QueryDto } from 'src/weekendy/dto/requete.dto';

@Injectable()
export class PayscaService {
  constructor(
    @InjectModel(Paysca.name)
    private readonly payscaModel: Model<PayscaDocument>,
    @InjectModel(Payscayear.name)
    private readonly payscayearModel: Model<PayscayearDocument>,
  ) {}

  async create(createPayscaDto: any) {
    const weekendy = await this.payscaModel.create(createPayscaDto);
  }

  async createca(createPayscaDto: CreatePayscaDto) {
    const weekendy = await this.payscaModel.create(createPayscaDto);
    const findcapaysYear = await this.payscayearModel
      .findOne({
        countryId: createPayscaDto.countryId,
        year: createPayscaDto.annee,
      })
      .exec();
    if (findcapaysYear == null) {
      await this.payscayearModel.create({
        countryId: createPayscaDto.countryId,
        year: createPayscaDto.annee,
        caTotal: createPayscaDto.caTotal,
      });
      return {
        message: 'created',
        status: 200,
      };
    } else {
      const updatePayscaDto = {
        countryId: createPayscaDto.countryId,
        year: createPayscaDto.annee,
        caTotal: findcapaysYear.caTotal + createPayscaDto.caTotal,
      };
      const update = await this.payscayearModel
        .findByIdAndUpdate({ _id: findcapaysYear._id }, updatePayscaDto, {
          new: true,
        })
        .lean();

      return {
        message: 'created',
        status: 200,
      };
    }
  }

  async findAllPaysCa(): Promise<Paysca[]> {
    return this.payscaModel.find().exec();
  }

  async updateCaPaysMoisDirect(id: string, createPayscaDto: CreatePayscaDto) {
    const update = await this.payscaModel
      .findByIdAndUpdate({ _id: id }, createPayscaDto, { new: true })
      .lean();
    const findcapaysYear = await this.payscayearModel
      .findOne({
        countryId: createPayscaDto.countryId,
        year: createPayscaDto.annee,
      })
      .exec();

    const updatePayscaDto = {
      countryId: createPayscaDto.countryId,
      year: createPayscaDto.annee,
      caTotal: findcapaysYear.caTotal + createPayscaDto.caTotal,
    };
    await this.payscayearModel
      .findByIdAndUpdate({ _id: findcapaysYear._id }, updatePayscaDto, {
        new: true,
      })
      .lean();
    return {
      message: 'created',
      status: 200,
    };
  }

  async findAll(query: QueryDto) {
    const result = [];
    const capays = await this.payscaModel
      .find({ countryId: query.paysId, annee: query.anneeId })
      .populate('countryId')
      .populate('mois')
      .exec();
    // console.log('capays',capays[0].annee);
    // for(let i=0; i<capays.length; i++){
    //   if(capays[i].annee == year){
    //     console.log('capays',capays[i])
    //     result.push(capays[i]);
    //   }
    // }
    // console.log('result',result);

    return capays;
  }

  async findAllCaYear() {
    const result = await this.payscayearModel
      .find()
      .populate('countryId')
      .populate('year');

    return result;
  }

  async findAllByCountry(countryId: string) {
    const capays = await this.payscaModel
      .find({ countryId: countryId })
      .populate('countryId');
    return capays;
  }

  async findOne(id: string) {
    const camois = await this.payscaModel.findOne({ countryId: id });
    return camois;
  }

  async findOnePaysCamoisExist(id: string, mois: string, annee: string) {
    const camois = await this.payscaModel
      .findOne({ countryId: id, mois: mois, annee: annee })
      .exec();

    return camois;
  }

  async findPaysCamois(id: string) {
    const camois = await this.payscaModel
      .find({ countryId: id })
      .populate('countryId')
      .populate('annee')
      .populate('mois')
      .exec();

    return camois;
  }

  async updateCaannee(anneeId: string, paysId: string, totalCa: number) {
    const camois = this.payscayearModel.findOneAndUpdate(
      { annee: anneeId, countryId: paysId }, // Condition
      { $set: { caTotal: totalCa } }, // Mise à jour
      { upsert: true, new: true }, // Création si inexistant
    );

    return camois;
  }

  async updateCamoisannee(
    anneeId: string,
    moisId: string,
    paysId: string,
    totalCa: number,
  ) {
    const camois = this.payscayearModel.findOneAndUpdate(
      { annee: anneeId, countryId: paysId }, // Condition
      { $set: { caTotal: totalCa } }, // Mise à jour
      { upsert: true, new: true }, // Création si inexistant
    );

    return camois;
  }

  async findOnePaysCaYearExist(id: string, year: string) {
    const cayear = await this.payscayearModel
      .findOne({ countryId: id, year: year })
      .exec();
    return cayear;
  }

  async findOnePaysCaAnneeExist(paysId: string, anneeId: string) {
    const cayear = await this.payscayearModel
      .findOne({ year: anneeId, countryId: paysId })
      .exec();
    return cayear;
  }

  async findOnePaysCaMoisAnneeExist(anneeId: any, moisId: any, paysId: any) {
    const cayear = await this.payscaModel
      .findOne({ annee: anneeId, mois: moisId, countryId: paysId })
      .exec();
    return cayear;
  }

  async updateCaPaysMois(
    id: string | Types.ObjectId,
    updateInfoPaysCaMois: UpdateQuery<
      HydratedDocument<Paysca> & { _id: Types.ObjectId }
    >,
  ) {
    try {
      const updatedRecord = await this.payscaModel
        .findByIdAndUpdate(id, updateInfoPaysCaMois, { new: true, lean: true })
        .exec();

      if (!updatedRecord) {
        console.log(`Aucune entrée trouvée avec l'ID: ${id}`);
        return null;
      }

      return updatedRecord;
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de l'entrée ID: ${id}`,
        error,
      );
      throw new Error('Mise à jour échouée');
    }
  }

  async createCaPaysYear(CapaysYear: any) {
    await this.payscayearModel.create(CapaysYear);
  }

  async updateyear(id: string, updatePayscaDto: any) {
    const update = await this.payscayearModel
      .findByIdAndUpdate({ _id: id }, updatePayscaDto, { new: true })
      .lean();
    return update;
  }

  async remove(id: string) {
    const paysca = await this.payscaModel.find({ countryId: id }).exec();

    if (paysca != null) {
      for (let i = 0; i < paysca.length; i++) {
        await this.payscaModel.findByIdAndRemove(paysca[i]._id);
      }
    }
  }

  async delete(id: string) {
    await this.payscaModel.findByIdAndRemove(id);
  }

  async findAllCabackup() {
    const result = await this.payscayearModel.find().exec();

    return result;
  }
}
