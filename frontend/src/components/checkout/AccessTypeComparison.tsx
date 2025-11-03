import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Users } from 'lucide-react';
import { AccessType } from '@/services/checkoutService';

interface AccessTypeComparisonProps {
  accessTypes: AccessType[];
  selectedTypeId?: number;
  onSelectType: (accessType: AccessType) => void;
  eventTitle: string;
}

const AccessTypeComparison: React.FC<AccessTypeComparisonProps> = ({
  accessTypes,
  selectedTypeId,
  onSelectType,
  eventTitle
}) => {
  const getTypeIcon = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case 'vip':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'expositor':
        return <Star className="w-6 h-6 text-purple-500" />;
      default:
        return <Users className="w-6 h-6 text-blue-500" />;
    }
  };

  const getTypeColor = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case 'vip':
        return 'border-yellow-200 bg-yellow-50';
      case 'expositor':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Selecciona tu Tipo de Acceso
        </h2>
        <p className="text-gray-600">
          {eventTitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accessTypes.map((accessType, index) => (
          <motion.div
            key={accessType.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`relative cursor-pointer transition-all duration-200 ${
                selectedTypeId === accessType.id
                  ? 'ring-2 ring-[#6B1E22] shadow-lg'
                  : 'hover:shadow-md'
              } ${getTypeColor(accessType.name)} ${
                !accessType.available ? 'opacity-50' : ''
              }`}
              onClick={() => accessType.available && onSelectType(accessType)}
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  {getTypeIcon(accessType.name)}
                </div>
                <CardTitle className="text-xl mb-2">{accessType.name}</CardTitle>
                <div className="text-3xl font-bold text-[#6B1E22] mb-2">
                  {formatPrice(accessType.price)}
                </div>
                <div className="flex justify-center gap-2 text-sm text-gray-600">
                  <span>{accessType.sold}/{accessType.capacity} vendidos</span>
                  {!accessType.available && (
                    <Badge variant="destructive" className="text-xs">
                      Agotado
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center mb-4">
                    {accessType.description}
                  </p>

                  <div className="space-y-2">
                    {accessType.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button
                      className={`w-full ${
                        selectedTypeId === accessType.id
                          ? 'bg-[#6B1E22] hover:bg-[#8a2b30]'
                          : ''
                      }`}
                      variant={selectedTypeId === accessType.id ? 'default' : 'outline'}
                      disabled={!accessType.available}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectType(accessType);
                      }}
                    >
                      {selectedTypeId === accessType.id ? 'Seleccionado' : 'Seleccionar'}
                    </Button>
                  </div>
                </div>
              </CardContent>

              {selectedTypeId === accessType.id && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#6B1E22] rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedTypeId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
        >
          <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-medium">
            Tipo de acceso seleccionado: {
              accessTypes.find(type => type.id === selectedTypeId)?.name
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AccessTypeComparison;