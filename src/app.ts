import app from '@/server.js';
import { env } from '@config/env.schema.js';

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
