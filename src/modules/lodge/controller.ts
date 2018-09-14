import { pick } from 'lodash';
import Lodge, { ILodge } from './model';

export const create = async (req, res) => {
  const { body } = req;
  const inputs = pick(body, ['council', 'name', 'chapters']);
  const lodge = new Lodge(inputs);
  await lodge.save();
  res.json({ lodge });
};

export const get = async (req, res) => {
  const { lodgeId } = req.params;
  const lodge = await Lodge.findById(lodgeId);
  res.json({ lodge });
};

export const list = async (req, res) => {
  const lodges = await Lodge.find();
  res.json({ lodges });
};

export const update = async (req, res) => {
  const { lodgeId } = req.params;
  const { body } = req;
  const inputs = pick(body, ['council', 'name', 'chapters']);
  const lodge = await Lodge.findOneAndUpdate(lodgeId, inputs, { new: true });
  res.json({ lodge });
};

export const remove = async (req, res) => {
  const { lodgeId } = req.params;
  const lodge: any = await Lodge.findById(lodgeId);
  if (!lodge) {
    return res.status(404).send();
  }
  await lodge.remove();
  res.status(202).send();
};
