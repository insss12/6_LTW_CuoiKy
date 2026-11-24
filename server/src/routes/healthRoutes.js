import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Server hoat dong binh thuong',
  });
});

export default router;
