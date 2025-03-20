import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { Zone, ZoneDocument } from './schemas/zone.schema';
import { Model, isObjectIdOrHexString } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Primesz, PrimeszDocument } from './schemas/primesz.schema';
import { Zoneca, ZonecaDocument } from './schemas/zoneca.schema';
import { MoisanneeController } from 'src/moisannee/moisannee.controller';
import { Zonecamois, ZonecamoisDocument } from './schemas/zonecamois.schema';

@Injectable()
export class ZoneService {
  constructor(
    @InjectModel(Zone.name) private readonly zoneModel: Model<ZoneDocument>,
    @InjectModel(Zoneca.name)
    private readonly zonecaModel: Model<ZonecaDocument>,
    @InjectModel(Zonecamois.name)
    private readonly zonecamoisModel: Model<ZonecamoisDocument>,
    @InjectModel(Primesz.name)
    private readonly primeszModel: Model<PrimeszDocument>,
  ) {}

  async create(createZoneDto: CreateZoneDto) {
    const alreadyExists = await this.zoneModel
      .exists({ name: createZoneDto.zone_name })
      .lean();
    if (alreadyExists) {
      throw new ConflictException(
        `cette zone existe déjà dans la base de données`,
      );
    }
    const createdzone = await this.zoneModel.create(createZoneDto);

    if (!createdzone) {
      throw new InternalServerErrorException(
        'Impossible de créer la zone, veuillez réessayer',
      );
    }
    return createdzone;
  }

  async findAll() {
    const zone = await this.zoneModel.find().populate('countryId').exec();

    return zone;
  }

  async findzonecabyZone(zoneId: string, annee: string) {
    const zoneca = await this.zonecaModel
      .findOne({ zoneId: zoneId, annee: annee })
      .exec();

    return zoneca;
  }

  async findzonecamoisbyZone(zoneId: string, annee: string, mois: string) {
    const zonecamois = await this.zonecaModel
      .findOne({ zoneId: zoneId, annee: annee, mois: mois })
      .exec();

    return zonecamois;
  }

  async findprimesz(zoneId: string, mois: string, annee: string) {
    const zoneca = await this.primeszModel
      .findOne({ zoneId: zoneId, mois: mois, annee: annee })
      .exec();
    // if (!zoneca) {
    //   throw new NotFoundException('ca de la zone de ce bureau non trouvée');
    // }

    return zoneca;
  }

  async createprimesz(data: any) {
    await this.primeszModel.create(data);
  }

  async createzoneca(data: any) {
    await this.zonecaModel.create(data);
  }

  async createzonecamois(data: any) {
    await this.zonecamoisModel.create(data);
  }

  async updatezoneca(id: string, updateZoneDto: any) {
    return this.zonecaModel
      .findOneAndUpdate({ id }, updateZoneDto, {
        new: true,
      })
      .lean();
  }

  async updatezonecamois(id: string, updateZoneDto: any) {
    return this.zonecamoisModel
      .findOneAndUpdate({ id }, updateZoneDto, {
        new: true,
      })
      .lean();
  }

  async findAllCaByZone(id: string) {
    const cazonebyid = await this.zonecamoisModel
      .find({ zoneId: id })
      .populate('mois')
      .populate('annee')
      .sort({ 'annee.value': -1, 'mois.valueMois': -1 })
      .exec();
    return cazonebyid;
  }

  async updateprimesz(id: string, updateZoneDto: any) {
    return this.primeszModel
      .findOneAndUpdate({ id }, updateZoneDto, {
        new: true,
      })
      .lean();
  }

  async findOne(id: string) {
    const zone = await this.zoneModel
      .findOne({ countryId: id })
      .populate('countryId')
      .exec();
    console.log(zone);
    if (!zone) {
      throw new NotFoundException('zone non trouvée');
    }
    return zone;
  }

  async findOneZonebyId(id: string) {
    const zone = await this.zoneModel.findById(id).exec();
    if (!zone) {
      console.log('test', {
        $oid: id,
      });
      const zone2 = await this.zoneModel.findById({ $oid: id }).exec();
      console.log(zone2);
      throw new NotFoundException('zone non trouvée');
    }
    return zone;
  }

  async findSingle(id: string) {
    const zone = await this.zoneModel.findById(id).populate('countryId').exec();
    console.log(zone);
    if (!zone) {
      throw new NotFoundException('zone non trouvée');
    }
    return zone;
  }

  async findpays(id: string) {
    const zone = await this.zoneModel
      .find({ countryId: id })
      .populate('countryId')
      .exec();

    if (!zone) {
      throw new NotFoundException('Pays non trouvé');
    }
    return zone;
  }

  async update(id: string, updateZoneDto: UpdateZoneDto) {
    console.log('updateZoneDto', updateZoneDto);
    return this.zoneModel
      .findByIdAndUpdate(
        id,
        { $set: updateZoneDto },
        {
          new: true,
        },
      )
      .lean();
  }

  async remove(id: string) {
    await this.zoneModel.findByIdAndRemove(id).catch((err) => {
      throw new BadRequestException(err);
    });

    return `Zone deleted`;
  }

  async findzonepaysDelete(id: string) {
    const zone = await this.zoneModel.find({ countryId: id }).exec();
    if (zone != null) {
      for (let i = 0; i < zone.length; i++) {
        await this.zoneModel.findByIdAndRemove(zone[i]._id);
      }
    }
    return;
  }

  async zonebackup() {
    return await this.zoneModel.find().exec();
  }
}
