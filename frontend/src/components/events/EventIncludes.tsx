import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
} from '@mui/material';
import {
  CheckCircle,
  School,
  Description,
  Coffee,
  Wifi,
  LocalParking,
  Restaurant,
  HeadsetMic,
  CardGiftcard,
  Videocam,
  CloudDownload,
  EmojiEvents,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface EventIncludesProps {
  includes: string[];
  layout?: 'list' | 'grid';
}

const EventIncludes: React.FC<EventIncludesProps> = ({ includes, layout = 'grid' }) => {
  const getIconForItem = (item: string): React.ReactNode => {
    const lowerItem = item.toLowerCase();

    if (lowerItem.includes('certificado')) return <School color="primary" />;
    if (lowerItem.includes('material') || lowerItem.includes('documento')) return <Description color="primary" />;
    if (lowerItem.includes('coffee break') || lowerItem.includes('café')) return <Coffee color="primary" />;
    if (lowerItem.includes('wifi') || lowerItem.includes('internet')) return <Wifi color="primary" />;
    if (lowerItem.includes('parking') || lowerItem.includes('estacionamiento')) return <LocalParking color="primary" />;
    if (lowerItem.includes('almuerzo') || lowerItem.includes('comida')) return <Restaurant color="primary" />;
    if (lowerItem.includes('soporte') || lowerItem.includes('asistencia')) return <HeadsetMic color="primary" />;
    if (lowerItem.includes('kit') || lowerItem.includes('regalo')) return <CardGiftcard color="primary" />;
    if (lowerItem.includes('grabación') || lowerItem.includes('video')) return <Videocam color="primary" />;
    if (lowerItem.includes('descarga') || lowerItem.includes('recurso')) return <CloudDownload color="primary" />;
    if (lowerItem.includes('premio') || lowerItem.includes('reconocimiento')) return <EmojiEvents color="primary" />;

    return <CheckCircle color="success" />;
  };

  if (!includes || includes.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Información sobre lo que incluye el evento estará disponible próximamente
        </Typography>
      </Paper>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  if (layout === 'list') {
    return (
      <Paper sx={{ p: 3 }}>
        <List>
          {includes.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ListItem
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateX(8px)',
                  },
                }}
              >
                <ListItemIcon>{getIconForItem(item)}</ListItemIcon>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{
                    variant: 'body1',
                  }}
                />
              </ListItem>
            </motion.div>
          ))}
        </List>
      </Paper>
    );
  }

  return (
    <Box component={"div" as any}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={2}>
          {includes.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    transition: 'all 0.3s',
                    cursor: 'default',
                    '&:hover': {
                      boxShadow: 4,
                      bgcolor: 'primary.light',
                      '& .MuiTypography-root': {
                        color: 'primary.contrastText',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      width: '100%',
                      p: 2,
                      '&:last-child': { pb: 2 },
                    }}
                  >
                    <Box
                      component={"div" as any}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 40,
                      }}
                    >
                      {getIconForItem(item)}
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        flex: 1,
                        transition: 'color 0.3s',
                      }}
                    >
                      {item}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Summary Footer */}
      <Box
        component={"div" as any}
        sx={{
          mt: 3,
          p: 2,
          bgcolor: 'success.light',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <CheckCircle sx={{ color: 'success.dark' }} />
        <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 'medium' }}>
          Este evento incluye {includes.length} beneficio{includes.length !== 1 ? 's' : ''} para tu experiencia completa
        </Typography>
      </Box>
    </Box>
  );
};

export default EventIncludes;
