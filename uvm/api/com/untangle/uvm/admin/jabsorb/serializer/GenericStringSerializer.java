/**
 * $Id$
 */
package com.untangle.uvm.admin.jabsorb.serializer;

import org.jabsorb.serializer.AbstractSerializer;
import org.jabsorb.serializer.MarshallException;
import org.jabsorb.serializer.ObjectMatch;
import org.jabsorb.serializer.SerializerState;
import org.jabsorb.serializer.UnmarshallException;

@SuppressWarnings({"serial","unchecked","rawtypes"})
public class GenericStringSerializer extends AbstractSerializer
{
    private Class clazz = null;
    
    public GenericStringSerializer( Class clazz )
    {
        this.clazz = clazz;
    }

    /**
     * @see org.jabsorb.serializer.Serializer#getJSONClasses()
     */
    public Class[] getJSONClasses()
    {
        return new Class[] { String.class };
    }

    /**
     * @see org.jabsorb.serializer.Serializer#getSerializableClasses()
     */
    public Class[] getSerializableClasses()
    {
        return new Class[] { this.clazz };
    }

    /**
     * @see org.jabsorb.serializer.Serializer#marshall(org.jabsorb.serializer.SerializerState, java.lang.Object, java.lang.Object)
     */
    public Object marshall(SerializerState state, Object p, Object o)
            throws MarshallException
    {
        if (this.clazz.isInstance(o)) {
            return o.toString();
        }
        return null;
    }

    /**
     * @see org.jabsorb.serializer.Serializer#tryUnmarshall(org.jabsorb.serializer.SerializerState, java.lang.Class, java.lang.Object)
     */
    public ObjectMatch tryUnmarshall(SerializerState state, Class clazz, Object json)
        throws UnmarshallException
    {
        state.setSerialized(json, ObjectMatch.OKAY);
        return ObjectMatch.OKAY;
    }

    /**
     * @see org.jabsorb.serializer.Serializer#unmarshall(org.jabsorb.serializer.SerializerState, java.lang.Class, java.lang.Object)
     */
    public Object unmarshall(SerializerState state, Class clazz, Object json)
            throws UnmarshallException
    {
        Object returnValue = null;
        String val = json instanceof String ? (String) json : json.toString();
        try {
            java.lang.reflect.Constructor constructor = this.clazz.getConstructor(new Class[]{String.class});
            returnValue = constructor.newInstance( val );
        } catch (Exception e) {
            throw new UnmarshallException("Invalid constructor: new " + clazz + "( " + val + " )", e);
        }
        
        if (returnValue == null) {
            throw new UnmarshallException("Invalid class: " + clazz);
        }
        state.setSerialized(json, returnValue);
        return returnValue;
    }

}
